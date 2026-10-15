package com.nandishhomes.payment.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nandishhomes.common.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Razorpay implementation prompt: the one place in the codebase allowed to
 * talk to Razorpay or touch the key secret / webhook secret.
 *
 * <p>Deliberately dependency-free (no {@code razorpay-java} SDK): this
 * source-only extract has no pom.xml/build.gradle for us to add a Maven
 * dependency to (see FILE_MAP.md's note), and everything Razorpay's Checkout
 * flow actually needs - creating an order over its plain REST API and
 * verifying an HMAC-SHA256 signature - is a few dozen lines against the JDK's
 * own {@link HttpClient} and {@link Mac}, both already present. If the real
 * project's pom.xml is later found to already include {@code com.razorpay:razorpay-java},
 * this class's two Razorpay-facing methods ({@link #createOrder} and the
 * signature checks) could be swapped for SDK calls without touching any of
 * its callers.</p>
 *
 * <p>Responsibilities: create a Razorpay order, verify a Checkout success
 * signature, verify a webhook signature, and (best-effort) fetch a payment
 * for manual reconciliation. Never exposes {@code key-secret}/
 * {@code webhook-secret} to a caller, a log line, or an HTTP response.</p>
 */
@Service
public class RazorpayPaymentService {
    private static final String API_BASE = "https://api.razorpay.com/v1";

    private final String keyId;
    private final String keySecret;
    private final String webhookSecret;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public RazorpayPaymentService(
            @Value("${razorpay.key-id:}") String keyId,
            @Value("${razorpay.key-secret:}") String keySecret,
            @Value("${razorpay.webhook-secret:}") String webhookSecret,
            ObjectMapper objectMapper) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.webhookSecret = webhookSecret;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
    }

    /** The public key id only - safe to hand to Angular for Razorpay Checkout. */
    public String publicKeyId() {
        return keyId;
    }

    /**
     * Creates a Razorpay order for the exact server-computed amount (paise).
     * {@code payment_capture=1} so a successful charge is auto-captured -
     * this codebase has no separate "capture" admin action, so leaving a
     * payment merely authorized would silently never collect the money.
     */
    public RazorpayOrder createOrder(String receipt, long amountPaise, String currency) {
        requireConfigured();
        ObjectNode body = objectMapper.createObjectNode();
        body.put("amount", amountPaise);
        body.put("currency", currency);
        body.put("receipt", receipt);
        body.put("payment_capture", 1);

        JsonNode response = send("POST", "/orders", body.toString());
        String id = textOrNull(response, "id");
        if (id == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Payment provider did not return an order id");
        }
        return new RazorpayOrder(id, response.path("amount").asLong(amountPaise),
                textOrNull(response, "currency"), textOrNull(response, "status"));
    }

    /** Best-effort fetch, for admin/manual reconciliation of a stuck payment - never required for the happy path. */
    public JsonNode fetchPayment(String razorpayPaymentId) {
        return send("GET", "/payments/" + razorpayPaymentId, null);
    }

    /** Checkout success handler: HMAC-SHA256(orderId + "|" + paymentId, key_secret) must equal the given signature. */
    public boolean verifyCheckoutSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        if (razorpayOrderId == null || razorpayPaymentId == null || razorpaySignature == null) return false;
        String expected = hmacSha256Hex(razorpayOrderId + "|" + razorpayPaymentId, keySecret);
        return constantTimeEquals(expected, razorpaySignature);
    }

    /** Webhook signature: HMAC-SHA256(raw request body, webhook_secret) must equal the X-Razorpay-Signature header. */
    public boolean verifyWebhookSignature(String rawBody, String signatureHeader) {
        if (rawBody == null || signatureHeader == null || webhookSecret == null || webhookSecret.isBlank()) return false;
        String expected = hmacSha256Hex(rawBody, webhookSecret);
        return constantTimeEquals(expected, signatureHeader);
    }

    public JsonNode parseWebhookBody(String rawBody) {
        try {
            return objectMapper.readTree(rawBody);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Malformed webhook payload");
        }
    }

    private void requireConfigured() {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            // Never leaks *which* value is missing beyond this generic message - avoids hinting at config internals.
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Online payment is not configured. Please try again shortly.");
        }
    }

    private JsonNode send(String method, String path, String jsonBody) {
        try {
            String auth = Base64.getEncoder().encodeToString((keyId + ":" + keySecret).getBytes(StandardCharsets.UTF_8));
            HttpRequest.Builder builder = HttpRequest.newBuilder()
                    .uri(URI.create(API_BASE + path))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Basic " + auth)
                    .header("Content-Type", "application/json");
            builder = "POST".equals(method)
                    ? builder.POST(HttpRequest.BodyPublishers.ofString(jsonBody == null ? "{}" : jsonBody, StandardCharsets.UTF_8))
                    : builder.GET();
            HttpResponse<String> response = httpClient.send(builder.build(), HttpResponse.BodyHandlers.ofString());
            JsonNode parsed = objectMapper.readTree(response.body());
            if (response.statusCode() >= 400) {
                // Razorpay's error body may contain its own diagnostic text; never relay it verbatim to the guest.
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Payment provider rejected the request");
            }
            return parsed;
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Could not reach the payment provider. Please try again.");
        }
    }

    private static String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null || value.isNull() ? null : value.asText();
    }

    private static String hmacSha256Hex(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Unable to compute payment signature", e);
        }
    }

    /** Fixed-time comparison so signature checking doesn't leak timing information. */
    private static boolean constantTimeEquals(String a, String b) {
        if (a == null || b == null || a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    /** Minimal projection of a Razorpay order - only what PaymentService needs. */
    public record RazorpayOrder(String id, long amount, String currency, String status) {
    }
}

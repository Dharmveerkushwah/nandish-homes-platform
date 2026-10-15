package com.nandishhomes.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApi(
            ApiException exception,
            HttpServletRequest request) {

        log.warn(
                "{} {} -> {}",
                request.getMethod(),
                request.getRequestURI(),
                exception.getMessage()
        );

        return response(
                exception.getStatus().value(),
                exception.getMessage(),
                request.getRequestURI()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException exception,
            HttpServletRequest request) {

        Map<String, String> fields = new LinkedHashMap<>();

        for (FieldError error : exception.getBindingResult().getFieldErrors()) {
            fields.put(
                    error.getField(),
                    error.getDefaultMessage()
            );
        }

        Map<String, Object> body = base(
                400,
                "Please correct the highlighted fields.",
                request.getRequestURI()
        );

        body.put("fields", fields);

        return ResponseEntity.badRequest().body(body);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraint(
            ConstraintViolationException exception,
            HttpServletRequest request) {

        log.warn(
                "{} {} -> validation constraint violation",
                request.getMethod(),
                request.getRequestURI(),
                exception
        );

        return response(
                400,
                "Please correct the highlighted fields.",
                request.getRequestURI()
        );
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Map<String, Object>> handleAuthentication(
            AuthenticationException exception,
            HttpServletRequest request) {

        return response(
                401,
                "Authentication is required to access this resource.",
                request.getRequestURI()
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleAccessDenied(
            AccessDeniedException exception,
            HttpServletRequest request) {

        return response(
                403,
                "You do not have permission to perform this action.",
                request.getRequestURI()
        );
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(
            DataIntegrityViolationException exception,
            HttpServletRequest request) {

        log.error(
                "Database integrity violation: {} {}",
                request.getMethod(),
                request.getRequestURI(),
                exception
        );

        return response(
                409,
                "This request conflicts with an existing record (duplicate or referenced data).",
                request.getRequestURI()
        );
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleUnexpected(
            Exception exception,
            HttpServletRequest request) {

        // IMPORTANT:
        // Log the complete exception including the stack trace.
        // The client still receives the safe generic message.
        log.error(
                "Unhandled exception: {} {}",
                request.getMethod(),
                request.getRequestURI(),
                exception
        );

        return response(
                500,
                "An unexpected error occurred. Please try again.",
                request.getRequestURI()
        );
    }

    private ResponseEntity<Map<String, Object>> response(
            int status,
            String message,
            String path) {

        return ResponseEntity
                .status(status)
                .body(base(status, message, path));
    }

    private Map<String, Object> base(
            int status,
            String message,
            String path) {

        Map<String, Object> body = new LinkedHashMap<>();

        body.put("timestamp", Instant.now());
        body.put("status", status);
        body.put("message", message);
        body.put("path", path);

        return body;
    }
}
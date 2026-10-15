package com.nandishhomes.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BCryptGenerator {

    public static void main(String[] args) {

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String password = "Admin@123";

        String hash = encoder.encode(password);

        System.out.println("=================================");
        System.out.println("Password : " + password);
        System.out.println("BCrypt   : " + hash);
        System.out.println("Matches  : " + encoder.matches(password, hash));
        System.out.println("=================================");
    }
}
package com.fintrack.infrastructure.security;

import com.fintrack.domain.share.ShareTokenGenerator;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;

/** 256 bits aleatórios em base64url: impossível de adivinhar e seguro para usar na URL. */
@Component
public class SecureRandomShareTokenGenerator implements ShareTokenGenerator {

    private static final int TOKEN_BYTES = 32;

    private final SecureRandom random = new SecureRandom();

    @Override
    public String newToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}

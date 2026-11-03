package com.fintrack.infrastructure.security;

import com.fintrack.infrastructure.config.FintrackProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtClaimNames;
import org.springframework.security.oauth2.jwt.JwtClaimValidator;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Collection;

/**
 * Valida o JWT HS256 que o servidor Next.js assina a cada chamada, com o segredo
 * compartilhado {@code BACKEND_JWT_SECRET}. O {@code sub} do token é o e-mail do usuário.
 */
@Configuration
public class JwtDecoderConfig {

    private static final int MIN_SECRET_BYTES = 32;

    @Bean
    JwtDecoder jwtDecoder(FintrackProperties properties) {
        FintrackProperties.Jwt jwt = properties.jwt();
        byte[] secret = jwt.secret() == null ? new byte[0] : jwt.secret().getBytes(StandardCharsets.UTF_8);
        if (secret.length < MIN_SECRET_BYTES) {
            throw new IllegalStateException("fintrack.jwt.secret (BACKEND_JWT_SECRET) deve ter ao menos 32 bytes.");
        }

        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withSecretKey(new SecretKeySpec(secret, "HmacSHA256"))
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                JwtValidators.createDefaultWithIssuer(jwt.issuer()),
                new JwtClaimValidator<Collection<String>>(JwtClaimNames.AUD,
                        aud -> aud != null && aud.contains(jwt.audience())),
                new JwtClaimValidator<String>(JwtClaimNames.SUB, sub -> sub != null && !sub.isBlank())));
        return decoder;
    }
}

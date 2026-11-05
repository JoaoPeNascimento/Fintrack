package com.fintrack.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * @param timezone fuso usado para determinar "hoje" e o mês corrente
 * @param jwt      parâmetros do token emitido pelo front-end (Next.js)
 */
@ConfigurationProperties("fintrack")
public record FintrackProperties(String timezone, Jwt jwt) {

    public record Jwt(String secret, String issuer, String audience) {
    }
}

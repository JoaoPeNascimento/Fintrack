package com.fintrack.domain.shared;

import java.math.BigDecimal;

/** Validações reutilizadas pelas entidades. */
public final class Guard {

    private Guard() {
    }

    /** Exige texto não vazio e devolve o valor sem espaços nas pontas. */
    public static String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new ValidationException(message);
        }
        return value.trim();
    }

    /** Texto opcional: devolve o valor sem espaços nas pontas, ou null se vazio. */
    public static String optionalText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    public static <T> T requireNonNull(T value, String message) {
        if (value == null) {
            throw new ValidationException(message);
        }
        return value;
    }

    public static BigDecimal requireNonNegative(BigDecimal value, String requiredMessage, String negativeMessage) {
        requireNonNull(value, requiredMessage);
        if (value.signum() < 0) {
            throw new ValidationException(negativeMessage);
        }
        return value;
    }

    public static int requireBetween(Integer value, int min, int max, String requiredMessage, String rangeMessage) {
        requireNonNull(value, requiredMessage);
        if (value < min || value > max) {
            throw new ValidationException(rangeMessage);
        }
        return value;
    }
}

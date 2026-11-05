package com.fintrack.domain.expense;

import com.fintrack.domain.shared.ValidationException;

public enum PaymentMethod {
    CARTAO,
    PIX,
    DINHEIRO;

    public static PaymentMethod from(String value) {
        if (value == null || value.isBlank()) {
            throw new ValidationException("Informe a forma de pagamento.");
        }
        try {
            return PaymentMethod.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Forma de pagamento inválida: " + value);
        }
    }
}

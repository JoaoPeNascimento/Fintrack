package com.fintrack.domain.expense;

import java.math.BigDecimal;
import java.math.MathContext;

/**
 * Compras parceladas no cartão são registradas pelo valor de cada parcela:
 * o total informado é dividido pelo número de parcelas. Aplica-se apenas na criação.
 */
public final class InstallmentSplitPolicy {

    private InstallmentSplitPolicy() {
    }

    public static BigDecimal valuePerInstallment(BigDecimal total, PaymentMethod method, int installments) {
        if (method == PaymentMethod.CARTAO && installments > 1) {
            return total.divide(BigDecimal.valueOf(installments), MathContext.DECIMAL64);
        }
        return total;
    }
}

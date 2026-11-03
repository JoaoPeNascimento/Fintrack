package com.fintrack.domain.expense;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;

/**
 * Define se um gasto entra no mês corrente (dashboard):
 * <ul>
 *     <li>gastos do mês corrente ou de meses futuros sempre entram;</li>
 *     <li>gastos de meses anteriores só entram se parcelados e ainda houver parcela a vencer,
 *     ou seja, se os meses decorridos forem menores que o total de parcelas.</li>
 * </ul>
 * O número de parcelas é imutável: a parcela vigente é derivada da data da compra.
 */
public final class ActiveExpensePolicy {

    private ActiveExpensePolicy() {
    }

    public static boolean isActive(LocalDate purchaseDate, int installments, YearMonth current) {
        if (purchaseDate == null) {
            return false;
        }
        YearMonth purchaseMonth = YearMonth.from(purchaseDate);
        if (!purchaseMonth.isBefore(current)) {
            return true;
        }
        if (installments > 1) {
            long monthsPassed = purchaseMonth.until(current, ChronoUnit.MONTHS);
            return monthsPassed < installments;
        }
        return false;
    }
}

package com.fintrack.domain.expense;

import java.math.BigDecimal;

/**
 * Linha do histórico mensal.
 *
 * @param label      ex.: "Março 2026"
 * @param shortLabel ex.: "03/2026"
 */
public record MonthlySummary(int month, int year, String label, String shortLabel,
                             BigDecimal totalAmount, long expenseCount) {

    private static final String[] MONTH_NAMES = {
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    };

    public static MonthlySummary of(MonthlyTotal total) {
        int month = total.month();
        int year = total.year();
        return new MonthlySummary(
                month,
                year,
                MONTH_NAMES[month - 1] + " " + year,
                String.format("%02d/%d", month, year),
                total.totalAmount(),
                total.expenseCount());
    }
}

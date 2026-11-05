package com.fintrack.domain.expense;

import java.math.BigDecimal;

/** Soma dos gastos de um usuário em um mês. */
public record MonthlyTotal(int year, int month, BigDecimal totalAmount, long expenseCount) {
}

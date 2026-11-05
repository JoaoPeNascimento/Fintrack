package com.fintrack.application.expense;

import com.fintrack.domain.expense.ExpenseRepository;
import com.fintrack.domain.expense.MonthlySummary;
import com.fintrack.domain.expense.MonthlyTotal;

import java.util.Comparator;
import java.util.List;

/** Histórico de gastos agrupado por mês, do mais recente para o mais antigo. */
public class GetMonthlySummary {

    private final ExpenseRepository expenses;

    public GetMonthlySummary(ExpenseRepository expenses) {
        this.expenses = expenses;
    }

    public List<MonthlySummary> execute(String userId) {
        return expenses.sumByMonth(userId).stream()
                .sorted(Comparator.comparingInt(MonthlyTotal::year)
                        .thenComparingInt(MonthlyTotal::month)
                        .reversed())
                .map(MonthlySummary::of)
                .toList();
    }
}

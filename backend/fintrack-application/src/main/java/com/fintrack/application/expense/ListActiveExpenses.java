package com.fintrack.application.expense;

import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseRepository;

import java.time.Clock;
import java.time.YearMonth;
import java.util.List;

/** Gastos que compõem o mês corrente: os do mês (ou futuros) e parcelas ainda em aberto. */
public class ListActiveExpenses {

    private final ExpenseRepository expenses;
    private final Clock clock;

    public ListActiveExpenses(ExpenseRepository expenses, Clock clock) {
        this.expenses = expenses;
        this.clock = clock;
    }

    public List<Expense> execute(String userId) {
        YearMonth current = YearMonth.now(clock);
        return expenses.findAllByUser(userId).stream()
                .filter(expense -> expense.isActiveIn(current))
                .toList();
    }
}

package com.fintrack.application.expense;

import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseRepository;
import com.fintrack.domain.shared.ValidationException;

import java.time.DateTimeException;
import java.time.YearMonth;
import java.util.List;

public class ListExpensesByMonth {

    private final ExpenseRepository expenses;

    public ListExpensesByMonth(ExpenseRepository expenses) {
        this.expenses = expenses;
    }

    public List<Expense> execute(String userId, int month, int year) {
        YearMonth period;
        try {
            period = YearMonth.of(year, month);
        } catch (DateTimeException e) {
            throw new ValidationException("Mês ou ano inválido.");
        }
        return expenses.findByUserAndDateBetween(userId, period.atDay(1), period.atEndOfMonth());
    }
}

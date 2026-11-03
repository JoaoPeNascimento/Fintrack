package com.fintrack.application.expense;

import com.fintrack.domain.expense.ExpenseRepository;
import com.fintrack.domain.shared.NotFoundException;

public class DeleteExpense {

    private final ExpenseRepository expenses;

    public DeleteExpense(ExpenseRepository expenses) {
        this.expenses = expenses;
    }

    public void execute(String userId, String expenseId) {
        if (!expenses.deleteByIdAndUser(expenseId, userId)) {
            throw new NotFoundException("Gasto não encontrado ou não autorizado.");
        }
    }
}

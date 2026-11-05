package com.fintrack.application.fixedexpense;

import com.fintrack.domain.fixedexpense.FixedExpenseRepository;
import com.fintrack.domain.shared.NotFoundException;

public class DeleteFixedExpense {

    private final FixedExpenseRepository fixedExpenses;

    public DeleteFixedExpense(FixedExpenseRepository fixedExpenses) {
        this.fixedExpenses = fixedExpenses;
    }

    public void execute(String userId, String id) {
        if (!fixedExpenses.deleteByIdAndUser(id, userId)) {
            throw new NotFoundException("Despesa não encontrada ou não autorizada.");
        }
    }
}

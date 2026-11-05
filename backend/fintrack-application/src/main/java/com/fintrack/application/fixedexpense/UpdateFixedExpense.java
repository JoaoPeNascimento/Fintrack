package com.fintrack.application.fixedexpense;

import com.fintrack.domain.fixedexpense.FixedExpense;
import com.fintrack.domain.fixedexpense.FixedExpenseDetails;
import com.fintrack.domain.fixedexpense.FixedExpenseRepository;
import com.fintrack.domain.shared.NotFoundException;

public class UpdateFixedExpense {

    private final FixedExpenseRepository fixedExpenses;

    public UpdateFixedExpense(FixedExpenseRepository fixedExpenses) {
        this.fixedExpenses = fixedExpenses;
    }

    public FixedExpense execute(String userId, String id, FixedExpenseDetails details) {
        FixedExpense expense = fixedExpenses.findByIdAndUser(id, userId)
                .orElseThrow(() -> new NotFoundException("Despesa fixa não encontrada ou não autorizada."));
        expense.update(details);
        return fixedExpenses.save(expense);
    }
}

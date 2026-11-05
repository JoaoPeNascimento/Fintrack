package com.fintrack.application.fixedexpense;

import com.fintrack.domain.fixedexpense.FixedExpense;
import com.fintrack.domain.fixedexpense.FixedExpenseDetails;
import com.fintrack.domain.fixedexpense.FixedExpenseRepository;

public class CreateFixedExpense {

    private final FixedExpenseRepository fixedExpenses;

    public CreateFixedExpense(FixedExpenseRepository fixedExpenses) {
        this.fixedExpenses = fixedExpenses;
    }

    public FixedExpense execute(String userId, FixedExpenseDetails details) {
        return fixedExpenses.save(FixedExpense.create(userId, details));
    }
}

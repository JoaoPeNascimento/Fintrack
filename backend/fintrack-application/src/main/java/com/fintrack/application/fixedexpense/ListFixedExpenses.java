package com.fintrack.application.fixedexpense;

import com.fintrack.domain.fixedexpense.FixedExpense;
import com.fintrack.domain.fixedexpense.FixedExpenseRepository;

import java.util.List;

public class ListFixedExpenses {

    private final FixedExpenseRepository fixedExpenses;

    public ListFixedExpenses(FixedExpenseRepository fixedExpenses) {
        this.fixedExpenses = fixedExpenses;
    }

    public List<FixedExpense> execute(String userId) {
        return fixedExpenses.findAllByUser(userId);
    }
}

package com.fintrack.application.expense;

import com.fintrack.domain.card.CardRepository;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseDetails;
import com.fintrack.domain.expense.ExpenseRepository;

import java.time.Clock;
import java.time.LocalDate;

public class CreateExpense {

    private final ExpenseRepository expenses;
    private final CardRepository cards;
    private final Clock clock;

    public CreateExpense(ExpenseRepository expenses, CardRepository cards, Clock clock) {
        this.expenses = expenses;
        this.cards = cards;
        this.clock = clock;
    }

    public Expense execute(String userId, ExpenseDetails details) {
        Expense expense = Expense.create(userId, details, LocalDate.now(clock));
        CardOwnershipCheck.verify(cards, expense);
        return expenses.save(expense);
    }
}

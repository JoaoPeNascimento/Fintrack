package com.fintrack.application.expense;

import com.fintrack.domain.card.CardRepository;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseDetails;
import com.fintrack.domain.expense.ExpenseRepository;
import com.fintrack.domain.shared.NotFoundException;

import java.time.Clock;
import java.time.LocalDate;

public class UpdateExpense {

    private final ExpenseRepository expenses;
    private final CardRepository cards;
    private final Clock clock;

    public UpdateExpense(ExpenseRepository expenses, CardRepository cards, Clock clock) {
        this.expenses = expenses;
        this.cards = cards;
        this.clock = clock;
    }

    public Expense execute(String userId, String expenseId, ExpenseDetails details) {
        Expense expense = expenses.findByIdAndUser(expenseId, userId)
                .orElseThrow(() -> new NotFoundException("Gasto não encontrado ou não autorizado."));
        expense.update(details, LocalDate.now(clock));
        CardOwnershipCheck.verify(cards, expense);
        return expenses.save(expense);
    }
}

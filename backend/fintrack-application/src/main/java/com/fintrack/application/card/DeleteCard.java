package com.fintrack.application.card;

import com.fintrack.domain.card.CardRepository;
import com.fintrack.domain.expense.ExpenseRepository;
import com.fintrack.domain.shared.NotFoundException;

/** Remove o cartão e desvincula os gastos dele, que continuam como pagos no cartão (sem cartão definido). */
public class DeleteCard {

    private final CardRepository cards;
    private final ExpenseRepository expenses;

    public DeleteCard(CardRepository cards, ExpenseRepository expenses) {
        this.cards = cards;
        this.expenses = expenses;
    }

    public void execute(String userId, String cardId) {
        if (!cards.deleteByIdAndUser(cardId, userId)) {
            throw new NotFoundException("Cartão não encontrado ou sem permissão para deletar.");
        }
        expenses.unlinkCard(userId, cardId);
    }
}

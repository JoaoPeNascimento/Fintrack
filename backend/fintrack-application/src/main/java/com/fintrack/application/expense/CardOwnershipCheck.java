package com.fintrack.application.expense;

import com.fintrack.domain.card.CardRepository;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.shared.ValidationException;

/** Garante que o cartão associado a um gasto pertence ao mesmo usuário. */
final class CardOwnershipCheck {

    private CardOwnershipCheck() {
    }

    static void verify(CardRepository cards, Expense expense) {
        String cardId = expense.cardId();
        if (cardId != null && !cards.existsByIdAndUser(cardId, expense.userId())) {
            throw new ValidationException("Cartão não encontrado.");
        }
    }
}

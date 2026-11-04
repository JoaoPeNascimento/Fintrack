package com.fintrack.application.expense;

import com.fintrack.domain.card.CardRepository;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.shared.ValidationException;

import java.util.Objects;

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

    /**
     * Na edição, só valida quando o cartão muda: um gasto que continua apontando para o cartão que já
     * tinha (mesmo que ele tenha sido removido) pode ter nome, valor etc. corrigidos normalmente.
     */
    static void verifyChange(CardRepository cards, String previousCardId, Expense expense) {
        if (!Objects.equals(previousCardId, expense.cardId())) {
            verify(cards, expense);
        }
    }
}

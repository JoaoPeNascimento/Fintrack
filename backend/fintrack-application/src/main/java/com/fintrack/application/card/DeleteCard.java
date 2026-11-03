package com.fintrack.application.card;

import com.fintrack.domain.card.CardRepository;
import com.fintrack.domain.shared.NotFoundException;

public class DeleteCard {

    private final CardRepository cards;

    public DeleteCard(CardRepository cards) {
        this.cards = cards;
    }

    public void execute(String userId, String cardId) {
        if (!cards.deleteByIdAndUser(cardId, userId)) {
            throw new NotFoundException("Cartão não encontrado ou sem permissão para deletar.");
        }
    }
}

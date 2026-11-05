package com.fintrack.application.card;

import com.fintrack.domain.card.Card;
import com.fintrack.domain.card.CardDetails;
import com.fintrack.domain.card.CardRepository;
import com.fintrack.domain.shared.NotFoundException;

public class UpdateCard {

    private final CardRepository cards;

    public UpdateCard(CardRepository cards) {
        this.cards = cards;
    }

    public Card execute(String userId, String cardId, CardDetails details) {
        Card card = cards.findByIdAndUser(cardId, userId)
                .orElseThrow(() -> new NotFoundException("Cartão não encontrado ou sem permissão para editar."));
        card.update(details);
        return cards.save(card);
    }
}

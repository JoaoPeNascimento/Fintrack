package com.fintrack.application.card;

import com.fintrack.domain.card.Card;
import com.fintrack.domain.card.CardDetails;
import com.fintrack.domain.card.CardRepository;

public class CreateCard {

    private final CardRepository cards;

    public CreateCard(CardRepository cards) {
        this.cards = cards;
    }

    public Card execute(String userId, CardDetails details) {
        return cards.save(Card.create(userId, details));
    }
}

package com.fintrack.application.card;

import com.fintrack.domain.card.Card;
import com.fintrack.domain.card.CardRepository;

import java.util.List;

public class ListCards {

    private final CardRepository cards;

    public ListCards(CardRepository cards) {
        this.cards = cards;
    }

    public List<Card> execute(String userId) {
        return cards.findAllByUser(userId);
    }
}

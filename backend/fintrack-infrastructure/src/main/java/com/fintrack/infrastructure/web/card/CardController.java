package com.fintrack.infrastructure.web.card;

import com.fintrack.application.card.CreateCard;
import com.fintrack.application.card.DeleteCard;
import com.fintrack.application.card.ListCards;
import com.fintrack.application.card.UpdateCard;
import com.fintrack.domain.card.Card;
import com.fintrack.domain.card.CardDetails;
import com.fintrack.infrastructure.web.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cards")
public class CardController {

    public record CardRequest(String name, BigDecimal limit, Integer closingDay, Integer dueDay, String color) {

        CardDetails toDetails() {
            return new CardDetails(name, limit, closingDay, dueDay, color);
        }
    }

    public record CardResponse(String id, String name, BigDecimal limit, int closingDay, int dueDay, String color) {

        static CardResponse from(Card card) {
            return new CardResponse(card.id(), card.name(), card.limit(), card.closingDay(), card.dueDay(), card.color());
        }
    }

    private final CreateCard createCard;
    private final ListCards listCards;
    private final UpdateCard updateCard;
    private final DeleteCard deleteCard;

    public CardController(CreateCard createCard, ListCards listCards, UpdateCard updateCard, DeleteCard deleteCard) {
        this.createCard = createCard;
        this.listCards = listCards;
        this.updateCard = updateCard;
        this.deleteCard = deleteCard;
    }

    @GetMapping
    public List<CardResponse> list(@CurrentUser String userId) {
        return listCards.execute(userId).stream().map(CardResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse create(@CurrentUser String userId, @RequestBody CardRequest request) {
        return CardResponse.from(createCard.execute(userId, request.toDetails()));
    }

    @PutMapping("/{id}")
    public CardResponse update(@CurrentUser String userId, @PathVariable String id, @RequestBody CardRequest request) {
        return CardResponse.from(updateCard.execute(userId, id, request.toDetails()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@CurrentUser String userId, @PathVariable String id) {
        deleteCard.execute(userId, id);
    }
}

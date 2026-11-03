package com.fintrack.domain.card;

import com.fintrack.domain.shared.Guard;

import java.math.BigDecimal;
import java.time.Instant;

public final class Card {

    private final String id;
    private final String userId;
    private final Instant createdAt;
    private String name;
    private BigDecimal limit;
    private int closingDay;
    private int dueDay;
    private String color;

    private Card(String id, String userId, Instant createdAt) {
        this.id = id;
        this.userId = Guard.requireText(userId, "Identificador de usuário é obrigatório");
        this.createdAt = createdAt;
    }

    public static Card create(String userId, CardDetails details) {
        Card card = new Card(null, userId, null);
        card.apply(details);
        return card;
    }

    /** Reconstrói um cartão já persistido, sem revalidar. */
    public static Card restore(String id, String userId, String name, BigDecimal limit,
                               int closingDay, int dueDay, String color, Instant createdAt) {
        Card card = new Card(id, userId, createdAt);
        card.name = name;
        card.limit = limit;
        card.closingDay = closingDay;
        card.dueDay = dueDay;
        card.color = color;
        return card;
    }

    public void update(CardDetails details) {
        apply(details);
    }

    private void apply(CardDetails details) {
        Guard.requireNonNull(details, "Os dados do cartão são obrigatórios");
        this.name = Guard.requireText(details.name(), "O nome do cartão é obrigatório");
        this.limit = Guard.requireNonNull(details.limit(), "O limite do cartão é obrigatório");
        this.closingDay = Guard.requireBetween(details.closingDay(), 1, 31,
                "O dia de fechamento é obrigatório", "O dia de fechamento deve estar entre 1 e 31");
        this.dueDay = Guard.requireBetween(details.dueDay(), 1, 31,
                "O dia de vencimento é obrigatório", "O dia de vencimento deve estar entre 1 e 31");
        this.color = Guard.requireText(details.color(), "A cor do cartão é obrigatória");
    }

    public String id() {
        return id;
    }

    public String userId() {
        return userId;
    }

    public String name() {
        return name;
    }

    public BigDecimal limit() {
        return limit;
    }

    public int closingDay() {
        return closingDay;
    }

    public int dueDay() {
        return dueDay;
    }

    public String color() {
        return color;
    }

    public Instant createdAt() {
        return createdAt;
    }
}

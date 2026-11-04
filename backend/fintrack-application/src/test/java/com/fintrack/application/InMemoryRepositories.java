package com.fintrack.application;

import com.fintrack.domain.card.Card;
import com.fintrack.domain.card.CardRepository;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseRepository;
import com.fintrack.domain.expense.MonthlyTotal;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

/** Implementações em memória das portas de persistência, para testes de casos de uso. */
public final class InMemoryRepositories {

    private InMemoryRepositories() {
    }

    public static class Cards implements CardRepository {

        private final Map<String, Card> store = new LinkedHashMap<>();

        @Override
        public Card save(Card card) {
            String id = card.id() != null ? card.id() : UUID.randomUUID().toString();
            Card saved = Card.restore(id, card.userId(), card.name(), card.limit(),
                    card.closingDay(), card.dueDay(), card.color(), card.createdAt());
            store.put(id, saved);
            return saved;
        }

        @Override
        public List<Card> findAllByUser(String userId) {
            return store.values().stream().filter(c -> c.userId().equals(userId)).toList();
        }

        @Override
        public Optional<Card> findByIdAndUser(String id, String userId) {
            return Optional.ofNullable(store.get(id)).filter(c -> c.userId().equals(userId));
        }

        @Override
        public boolean existsByIdAndUser(String id, String userId) {
            return findByIdAndUser(id, userId).isPresent();
        }

        @Override
        public boolean deleteByIdAndUser(String id, String userId) {
            return findByIdAndUser(id, userId).map(c -> store.remove(id) != null).orElse(false);
        }
    }

    public static class Expenses implements ExpenseRepository {

        private final Map<String, Expense> store = new LinkedHashMap<>();

        @Override
        public Expense save(Expense e) {
            String id = e.id() != null ? e.id() : UUID.randomUUID().toString();
            Expense saved = Expense.restore(id, e.userId(), e.name(), e.description(), e.value(), e.date(),
                    e.paymentMethod(), e.installments(), e.cardId(), e.createdAt());
            store.put(id, saved);
            return saved;
        }

        @Override
        public Optional<Expense> findByIdAndUser(String id, String userId) {
            return Optional.ofNullable(store.get(id)).filter(e -> e.userId().equals(userId));
        }

        @Override
        public List<Expense> findAllByUser(String userId) {
            return store.values().stream()
                    .filter(e -> e.userId().equals(userId))
                    .sorted(Comparator.comparing(Expense::date).reversed())
                    .toList();
        }

        @Override
        public List<Expense> findByUserAndDateBetween(String userId, LocalDate start, LocalDate end) {
            return findAllByUser(userId).stream()
                    .filter(e -> !e.date().isBefore(start) && !e.date().isAfter(end))
                    .toList();
        }

        @Override
        public List<MonthlyTotal> sumByMonth(String userId) {
            return findAllByUser(userId).stream()
                    .collect(Collectors.groupingBy(e -> YearMonth.from(e.date())))
                    .entrySet().stream()
                    .map(entry -> new MonthlyTotal(entry.getKey().getYear(), entry.getKey().getMonthValue(),
                            entry.getValue().stream().map(Expense::value).reduce(BigDecimal.ZERO, BigDecimal::add),
                            entry.getValue().size()))
                    .toList();
        }

        @Override
        public boolean deleteByIdAndUser(String id, String userId) {
            return findByIdAndUser(id, userId).map(e -> store.remove(id) != null).orElse(false);
        }

        @Override
        public void unlinkCard(String userId, String cardId) {
            store.replaceAll((id, e) -> e.userId().equals(userId) && cardId.equals(e.cardId())
                    ? Expense.restore(id, e.userId(), e.name(), e.description(), e.value(), e.date(),
                            e.paymentMethod(), e.installments(), null, e.createdAt())
                    : e);
        }
    }
}

package com.fintrack.application;

import com.fintrack.domain.card.Card;
import com.fintrack.domain.card.CardRepository;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseRepository;
import com.fintrack.domain.expense.MonthlyTotal;
import com.fintrack.domain.share.ExpenseShare;
import com.fintrack.domain.share.ExpenseShareRepository;
import com.fintrack.domain.share.ShareMember;
import com.fintrack.domain.user.User;
import com.fintrack.domain.user.UserRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.Objects;
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

    public static class Users implements UserRepository {

        private final Map<String, User> store = new LinkedHashMap<>();

        public User add(String id, String email, String name) {
            User user = new User(id, email, name, null, User.DEFAULT_PROVIDER);
            store.put(id, user);
            return user;
        }

        @Override
        public Optional<User> findByEmail(String email) {
            return store.values().stream().filter(u -> u.email().equals(email)).findFirst();
        }

        @Override
        public List<User> findAllByIds(Collection<String> ids) {
            return ids.stream().map(store::get).filter(Objects::nonNull).toList();
        }

        @Override
        public User save(User user) {
            String id = user.id() != null ? user.id() : UUID.randomUUID().toString();
            User saved = new User(id, user.email(), user.name(), user.image(), user.provider());
            store.put(id, saved);
            return saved;
        }

        @Override
        public User findOrRegister(User candidate) {
            return findByEmail(candidate.email()).orElseGet(() -> save(candidate));
        }
    }

    /** Guarda cópias, como o banco: alterações no objeto só valem após {@code save}/{@code addMember}. */
    public static class Shares implements ExpenseShareRepository {

        private final Map<String, ExpenseShare> byOwner = new LinkedHashMap<>();

        @Override
        public ExpenseShare save(ExpenseShare share) {
            ExpenseShare current = byOwner.get(share.ownerId());
            String id = current != null ? current.id() : UUID.randomUUID().toString();
            List<ShareMember> members = current != null ? current.members() : List.of();
            ExpenseShare saved = ExpenseShare.restore(id, share.ownerId(), share.token(), share.permission(),
                    share.enabled(), members);
            byOwner.put(share.ownerId(), saved);
            return copy(saved);
        }

        @Override
        public Optional<ExpenseShare> findByOwner(String ownerId) {
            return Optional.ofNullable(byOwner.get(ownerId)).map(Shares::copy);
        }

        @Override
        public Optional<ExpenseShare> findByToken(String token) {
            return byOwner.values().stream().filter(s -> s.token().equals(token)).findFirst().map(Shares::copy);
        }

        @Override
        public List<ExpenseShare> findAllByMember(String userId) {
            return byOwner.values().stream().filter(s -> s.isMember(userId)).map(Shares::copy).toList();
        }

        @Override
        public void addMember(String ownerId, ShareMember member) {
            ExpenseShare share = byOwner.get(ownerId);
            if (share != null && !share.isMember(member.userId())) {
                List<ShareMember> members = new ArrayList<>(share.members());
                members.add(member);
                byOwner.put(ownerId, ExpenseShare.restore(share.id(), ownerId, share.token(), share.permission(),
                        share.enabled(), members));
            }
        }

        @Override
        public boolean removeMember(String ownerId, String userId) {
            ExpenseShare share = byOwner.get(ownerId);
            return share != null && share.removeMember(userId);
        }

        private static ExpenseShare copy(ExpenseShare s) {
            return ExpenseShare.restore(s.id(), s.ownerId(), s.token(), s.permission(), s.enabled(), s.members());
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

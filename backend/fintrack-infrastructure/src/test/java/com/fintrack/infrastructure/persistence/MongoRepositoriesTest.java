package com.fintrack.infrastructure.persistence;

import com.fintrack.domain.card.Card;
import com.fintrack.domain.card.CardDetails;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseDetails;
import com.fintrack.domain.expense.MonthlyTotal;
import com.fintrack.domain.expense.PaymentMethod;
import com.fintrack.domain.user.User;
import com.fintrack.infrastructure.persistence.mongo.MongoCardRepository;
import com.fintrack.infrastructure.persistence.mongo.MongoExpenseRepository;
import com.fintrack.infrastructure.persistence.mongo.MongoUserRepository;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

/** Garante compatibilidade com os documentos gravados pelo Mongoose. Requer Docker. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@Testcontainers(disabledWithoutDocker = true)
class MongoRepositoriesTest {

    @Container
    @ServiceConnection
    static MongoDBContainer mongo = new MongoDBContainer("mongo:7");

    private static final ObjectId USER = new ObjectId();

    @Autowired
    MongoTemplate template;
    @Autowired
    MongoExpenseRepository expenses;
    @Autowired
    MongoCardRepository cards;
    @Autowired
    MongoUserRepository users;

    @BeforeEach
    void clean() {
        template.getCollection("gastos").drop();
        template.getCollection("cards").drop();
        template.getCollection("users").deleteMany(new Document());
    }

    private void insertLegacyExpense(String name, double value, String isoDate, int installments) {
        template.getCollection("gastos").insertOne(new Document()
                .append("name", name)
                .append("value", value)
                .append("date", Date.from(Instant.parse(isoDate)))
                .append("payment_method", "PIX")
                .append("installments", installments)
                .append("userId", USER)
                .append("createdAt", new Date())
                .append("__v", 0));
    }

    @Test
    void readsLegacyExpensesAndAggregatesByMonth() {
        insertLegacyExpense("Mercado", 100.5, "2026-03-10T00:00:00Z", 1);
        insertLegacyExpense("Farmácia", 20, "2026-03-31T00:00:00Z", 1);
        insertLegacyExpense("Luz", 80, "2026-02-01T00:00:00Z", 1);

        List<Expense> all = expenses.findAllByUser(USER.toHexString());
        List<Expense> march = expenses.findByUserAndDateBetween(USER.toHexString(),
                LocalDate.of(2026, 3, 1), LocalDate.of(2026, 3, 31));
        List<MonthlyTotal> totals = expenses.sumByMonth(USER.toHexString());

        assertThat(all).extracting(Expense::name).containsExactly("Farmácia", "Mercado", "Luz");
        assertThat(march).extracting(Expense::date)
                .containsExactly(LocalDate.of(2026, 3, 31), LocalDate.of(2026, 3, 10));
        assertThat(totals).anySatisfy(t -> {
            assertThat(t.year()).isEqualTo(2026);
            assertThat(t.month()).isEqualTo(3);
            assertThat(t.totalAmount()).isEqualByComparingTo("120.5");
            assertThat(t.expenseCount()).isEqualTo(2);
        });
    }

    @Test
    void savesExpenseWithObjectIdUserAndWithoutTypeHint() {
        Expense saved = expenses.save(Expense.create(USER.toHexString(),
                new ExpenseDetails("TV", null, new BigDecimal("300"), LocalDate.of(2026, 3, 5),
                        PaymentMethod.CARTAO, 3, null), LocalDate.now()));

        Document raw = template.getCollection("gastos").find().first();
        assertThat(raw.get("userId")).isEqualTo(USER);
        assertThat(raw.get("_id")).isInstanceOf(ObjectId.class);
        assertThat(raw.getString("payment_method")).isEqualTo("CARTAO");
        assertThat(raw).doesNotContainKey("_class");
        assertThat(expenses.findByIdAndUser(saved.id(), new ObjectId().toHexString())).isEmpty();
        assertThat(expenses.deleteByIdAndUser("not-an-id", USER.toHexString())).isFalse();
    }

    @Test
    void cardsKeepStringUserId() {
        Card card = cards.save(Card.create(USER.toHexString(),
                new CardDetails("Nubank", new BigDecimal("5000"), 3, 10, "purple")));

        Document raw = template.getCollection("cards").find().first();
        assertThat(raw.get("userId")).isEqualTo(USER.toHexString());
        assertThat(cards.existsByIdAndUser(card.id(), USER.toHexString())).isTrue();
        assertThat(cards.findAllByUser(USER.toHexString())).hasSize(1);
    }

    @Test
    void readsLegacyExpenseWithInvalidPaymentMethodInsteadOfFailingTheList() {
        insertLegacyExpense("Mercado", 50, "2026-03-10T00:00:00Z", 1);
        template.getCollection("gastos").insertOne(new Document()
                .append("name", "Sem forma").append("value", 10.0)
                .append("date", Date.from(Instant.parse("2026-03-11T00:00:00Z")))
                .append("payment_method", "BOLETO").append("userId", USER));
        template.getCollection("gastos").insertOne(new Document()
                .append("name", "No cartão").append("value", 10.0)
                .append("date", Date.from(Instant.parse("2026-03-12T00:00:00Z")))
                .append("cardId", "abc").append("userId", USER));

        List<Expense> all = expenses.findAllByUser(USER.toHexString());

        assertThat(all).extracting(Expense::name, Expense::paymentMethod).containsExactly(
                tuple("No cartão", PaymentMethod.CARTAO),
                tuple("Sem forma", PaymentMethod.DINHEIRO),
                tuple("Mercado", PaymentMethod.PIX));
    }

    @Test
    void findOrRegisterKeepsExistingLegacyUser() {
        ObjectId legacyId = new ObjectId();
        template.getCollection("users").insertOne(new Document("_id", legacyId)
                .append("email", "legacy@x.com").append("name", "Antigo"));

        User user = users.findOrRegister(User.register("legacy@x.com", "Novo", null));

        assertThat(user.id()).isEqualTo(legacyId.toHexString());
        assertThat(user.name()).isEqualTo("Antigo");
        assertThat(template.getCollection("users").countDocuments()).isEqualTo(1);
    }

    @Test
    void concurrentFirstAccessCreatesASingleUser() throws Exception {
        int threads = 8;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch start = new CountDownLatch(1);
        try {
            List<CompletableFuture<User>> calls = IntStream.range(0, threads)
                    .mapToObj(i -> CompletableFuture.supplyAsync(() -> {
                        try {
                            start.await();
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        }
                        return users.findOrRegister(User.register("new@x.com", "Novo", null));
                    }, pool))
                    .toList();
            start.countDown();

            List<String> ids = calls.stream().map(CompletableFuture::join).map(User::id).distinct().toList();

            assertThat(ids).hasSize(1);
            assertThat(template.getCollection("users").countDocuments(new Document("email", "new@x.com")))
                    .isEqualTo(1);
        } finally {
            pool.shutdownNow();
        }
    }

    @Test
    void unlinkCardOnlyTouchesExpensesOfThatUserAndCard() {
        String cardId = new ObjectId().toHexString();
        Expense mine = expenses.save(Expense.create(USER.toHexString(), new ExpenseDetails("TV", null,
                new BigDecimal("300"), LocalDate.of(2026, 3, 5), PaymentMethod.CARTAO, 3, cardId), LocalDate.now()));
        String otherUser = new ObjectId().toHexString();
        Expense theirs = expenses.save(Expense.create(otherUser, new ExpenseDetails("TV", null,
                new BigDecimal("300"), LocalDate.of(2026, 3, 5), PaymentMethod.CARTAO, 3, cardId), LocalDate.now()));

        expenses.unlinkCard(USER.toHexString(), cardId);

        Expense unlinked = expenses.findByIdAndUser(mine.id(), USER.toHexString()).orElseThrow();
        assertThat(unlinked.cardId()).isNull();
        assertThat(unlinked.paymentMethod()).isEqualTo(PaymentMethod.CARTAO);
        assertThat(unlinked.installments()).isEqualTo(3);
        assertThat(expenses.findByIdAndUser(theirs.id(), otherUser).orElseThrow().cardId()).isEqualTo(cardId);
    }
}

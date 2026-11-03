package com.fintrack.infrastructure.persistence;

import com.fintrack.domain.card.Card;
import com.fintrack.domain.card.CardDetails;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseDetails;
import com.fintrack.domain.expense.MonthlyTotal;
import com.fintrack.domain.expense.PaymentMethod;
import com.fintrack.infrastructure.persistence.mongo.MongoCardRepository;
import com.fintrack.infrastructure.persistence.mongo.MongoExpenseRepository;
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

import static org.assertj.core.api.Assertions.assertThat;

/** Garante compatibilidade com os documentos gravados pelo Mongoose. Requer Docker. */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
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

    @BeforeEach
    void clean() {
        template.getCollection("gastos").drop();
        template.getCollection("cards").drop();
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
}

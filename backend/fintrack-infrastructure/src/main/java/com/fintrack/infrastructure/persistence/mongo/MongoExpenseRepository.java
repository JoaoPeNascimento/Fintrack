package com.fintrack.infrastructure.persistence.mongo;

import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseRepository;
import com.fintrack.domain.expense.MonthlyTotal;
import com.fintrack.domain.expense.PaymentMethod;
import com.fintrack.domain.shared.ValidationException;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.DateOperators;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.springframework.data.mongodb.core.aggregation.Aggregation.group;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.match;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.newAggregation;
import static org.springframework.data.mongodb.core.aggregation.Aggregation.project;
import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

/**
 * Datas de gastos são dias do calendário gravados como meia-noite UTC (formato herdado do
 * {@code new Date("yyyy-MM-dd")} do front-end), por isso as conversões usam sempre UTC.
 */
@Repository
public class MongoExpenseRepository implements ExpenseRepository {

    private static final Logger log = LoggerFactory.getLogger(MongoExpenseRepository.class);
    private static final Sort BY_DATE_DESC = Sort.by(Sort.Direction.DESC, "date");

    private final MongoTemplate mongo;
    private final Clock clock;

    public MongoExpenseRepository(MongoTemplate mongo, Clock clock) {
        this.mongo = mongo;
        this.clock = clock;
    }

    @Override
    public Expense save(Expense expense) {
        Instant now = clock.instant();
        String id = expense.id() != null ? expense.id() : MongoIds.newId();
        Instant createdAt = expense.createdAt() != null ? expense.createdAt() : now;
        ExpenseDocument saved = mongo.save(new ExpenseDocument(id, expense.name(), expense.description(),
                expense.value().doubleValue(), toInstant(expense.date()), expense.paymentMethod().name(),
                expense.installments(), expense.cardId(), expense.userId(), createdAt, now));
        return toDomain(saved);
    }

    @Override
    public Optional<Expense> findByIdAndUser(String id, String userId) {
        if (!MongoIds.isValid(id)) {
            return Optional.empty();
        }
        return Optional.ofNullable(mongo.findOne(query(byIdAndUser(id, userId)), ExpenseDocument.class))
                .map(MongoExpenseRepository::toDomain);
    }

    @Override
    public List<Expense> findAllByUser(String userId) {
        return find(query(ownedBy(userId)).with(BY_DATE_DESC));
    }

    @Override
    public List<Expense> findByUserAndDateBetween(String userId, LocalDate start, LocalDate end) {
        Criteria criteria = ownedBy(userId).and("date")
                .gte(toInstant(start))
                .lt(toInstant(end.plusDays(1)));
        return find(query(criteria).with(BY_DATE_DESC));
    }

    @Override
    public List<MonthlyTotal> sumByMonth(String userId) {
        Aggregation aggregation = newAggregation(
                match(ownedBy(userId).and("date").ne(null)),
                project("value")
                        .and(DateOperators.Year.yearOf("date")).as("year")
                        .and(DateOperators.Month.monthOf("date")).as("month"),
                group("year", "month").sum("value").as("totalAmount").count().as("expenseCount"));

        return mongo.aggregate(aggregation, ExpenseDocument.COLLECTION, Document.class)
                .getMappedResults().stream()
                .map(MongoExpenseRepository::toMonthlyTotal)
                .toList();
    }

    @Override
    public boolean deleteByIdAndUser(String id, String userId) {
        return MongoIds.isValid(id)
                && mongo.remove(query(byIdAndUser(id, userId)), ExpenseDocument.class).getDeletedCount() > 0;
    }

    @Override
    public void unlinkCard(String userId, String cardId) {
        mongo.updateMulti(query(ownedBy(userId).and("cardId").is(cardId)),
                new Update().unset("cardId").set("updatedAt", clock.instant()), ExpenseDocument.class);
    }

    private List<Expense> find(Query query) {
        return mongo.find(query, ExpenseDocument.class).stream()
                .map(MongoExpenseRepository::toDomainSafely)
                .flatMap(Optional::stream)
                .toList();
    }

    private static Criteria ownedBy(String userId) {
        return where("userId").is(new ObjectId(userId));
    }

    private static Criteria byIdAndUser(String id, String userId) {
        return where("_id").is(id).and("userId").is(new ObjectId(userId));
    }

    private static MonthlyTotal toMonthlyTotal(Document row) {
        Document key = row.get("_id") instanceof Document id ? id : row;
        Number total = (Number) row.get("totalAmount");
        Number count = (Number) row.get("expenseCount");
        return new MonthlyTotal(
                ((Number) key.get("year")).intValue(),
                ((Number) key.get("month")).intValue(),
                total == null ? BigDecimal.ZERO : BigDecimal.valueOf(total.doubleValue()),
                count == null ? 0 : count.longValue());
    }

    private static Instant toInstant(LocalDate date) {
        return date.atStartOfDay(ZoneOffset.UTC).toInstant();
    }

    private static Expense toDomain(ExpenseDocument doc) {
        return Expense.restore(doc.id(), doc.userId(), doc.name(), doc.description(),
                doc.value() == null ? BigDecimal.ZERO : BigDecimal.valueOf(doc.value()),
                doc.date() == null ? null : LocalDate.ofInstant(doc.date(), ZoneOffset.UTC),
                paymentMethodOf(doc),
                doc.installments() == null || doc.installments() < 1 ? 1 : doc.installments(),
                doc.cardId(), doc.createdAt());
    }

    /**
     * Documentos legados podem ter forma de pagamento ausente ou fora do enum (o {@code updateOne} do
     * Mongoose não rodava validators). Em vez de falhar a leitura, assume CARTAO se houver cartão
     * vinculado e DINHEIRO caso contrário, e registra o documento para correção manual.
     */
    static PaymentMethod paymentMethodOf(ExpenseDocument doc) {
        try {
            return PaymentMethod.from(doc.paymentMethod());
        } catch (ValidationException e) {
            PaymentMethod fallback = doc.cardId() != null && !doc.cardId().isBlank()
                    ? PaymentMethod.CARTAO : PaymentMethod.DINHEIRO;
            log.warn("Gasto {} com forma de pagamento inválida ({}); lido como {}.",
                    doc.id(), doc.paymentMethod(), fallback);
            return fallback;
        }
    }

    /** Um documento malformado não pode derrubar a listagem inteira: ele é ignorado e logado. */
    private static Optional<Expense> toDomainSafely(ExpenseDocument doc) {
        try {
            return Optional.of(toDomain(doc));
        } catch (RuntimeException e) {
            log.error("Gasto {} ignorado: documento inválido ({}).", doc.id(), e.getMessage());
            return Optional.empty();
        }
    }
}

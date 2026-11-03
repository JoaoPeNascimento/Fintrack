package com.fintrack.infrastructure.persistence.mongo;

import com.fintrack.domain.fixedexpense.FixedExpense;
import com.fintrack.domain.fixedexpense.FixedExpenseRepository;
import org.bson.types.ObjectId;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

@Repository
public class MongoFixedExpenseRepository implements FixedExpenseRepository {

    private final MongoTemplate mongo;
    private final Clock clock;

    public MongoFixedExpenseRepository(MongoTemplate mongo, Clock clock) {
        this.mongo = mongo;
        this.clock = clock;
    }

    @Override
    public FixedExpense save(FixedExpense expense) {
        Instant now = clock.instant();
        String id = expense.id() != null ? expense.id() : MongoIds.newId();
        Instant createdAt = expense.createdAt() != null ? expense.createdAt() : now;
        FixedExpenseDocument saved = mongo.save(new FixedExpenseDocument(id, expense.name(), expense.description(),
                expense.value().doubleValue(), expense.userId(), createdAt, now));
        return toDomain(saved);
    }

    @Override
    public List<FixedExpense> findAllByUser(String userId) {
        Query query = query(where("userId").is(new ObjectId(userId))).with(Sort.by(Sort.Direction.DESC, "createdAt"));
        return mongo.find(query, FixedExpenseDocument.class).stream()
                .map(MongoFixedExpenseRepository::toDomain)
                .toList();
    }

    @Override
    public Optional<FixedExpense> findByIdAndUser(String id, String userId) {
        if (!MongoIds.isValid(id)) {
            return Optional.empty();
        }
        return Optional.ofNullable(mongo.findOne(byIdAndUser(id, userId), FixedExpenseDocument.class))
                .map(MongoFixedExpenseRepository::toDomain);
    }

    @Override
    public boolean deleteByIdAndUser(String id, String userId) {
        return MongoIds.isValid(id)
                && mongo.remove(byIdAndUser(id, userId), FixedExpenseDocument.class).getDeletedCount() > 0;
    }

    private static Query byIdAndUser(String id, String userId) {
        return query(where("_id").is(id).and("userId").is(new ObjectId(userId)));
    }

    private static FixedExpense toDomain(FixedExpenseDocument doc) {
        return FixedExpense.restore(doc.id(), doc.userId(), doc.name(), doc.description(),
                doc.value() == null ? BigDecimal.ZERO : BigDecimal.valueOf(doc.value()), doc.createdAt());
    }
}

package com.fintrack.infrastructure.persistence.mongo;

import com.fintrack.domain.card.Card;
import com.fintrack.domain.card.CardRepository;
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
public class MongoCardRepository implements CardRepository {

    private final MongoTemplate mongo;
    private final Clock clock;

    public MongoCardRepository(MongoTemplate mongo, Clock clock) {
        this.mongo = mongo;
        this.clock = clock;
    }

    @Override
    public Card save(Card card) {
        Instant now = clock.instant();
        String id = card.id() != null ? card.id() : MongoIds.newId();
        Instant createdAt = card.createdAt() != null ? card.createdAt() : now;
        CardDocument saved = mongo.save(new CardDocument(id, card.name(), card.limit().doubleValue(),
                card.closingDay(), card.dueDay(), card.color(), card.userId(), createdAt, now));
        return toDomain(saved);
    }

    @Override
    public List<Card> findAllByUser(String userId) {
        Query query = query(where("userId").is(userId)).with(Sort.by(Sort.Direction.DESC, "createdAt"));
        return mongo.find(query, CardDocument.class).stream().map(MongoCardRepository::toDomain).toList();
    }

    @Override
    public Optional<Card> findByIdAndUser(String id, String userId) {
        if (!MongoIds.isValid(id)) {
            return Optional.empty();
        }
        return Optional.ofNullable(mongo.findOne(byIdAndUser(id, userId), CardDocument.class))
                .map(MongoCardRepository::toDomain);
    }

    @Override
    public boolean existsByIdAndUser(String id, String userId) {
        return MongoIds.isValid(id) && mongo.exists(byIdAndUser(id, userId), CardDocument.class);
    }

    @Override
    public boolean deleteByIdAndUser(String id, String userId) {
        return MongoIds.isValid(id) && mongo.remove(byIdAndUser(id, userId), CardDocument.class).getDeletedCount() > 0;
    }

    private static Query byIdAndUser(String id, String userId) {
        return query(where("_id").is(id).and("userId").is(userId));
    }

    private static Card toDomain(CardDocument doc) {
        return Card.restore(doc.id(), doc.userId(), doc.name(),
                doc.limit() == null ? BigDecimal.ZERO : BigDecimal.valueOf(doc.limit()),
                doc.closingDay() == null ? 0 : doc.closingDay(),
                doc.dueDay() == null ? 0 : doc.dueDay(),
                doc.color(), doc.createdAt());
    }
}

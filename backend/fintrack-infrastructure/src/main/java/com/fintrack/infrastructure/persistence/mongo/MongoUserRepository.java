package com.fintrack.infrastructure.persistence.mongo;

import com.fintrack.domain.user.User;
import com.fintrack.domain.user.UserRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Repository;

import java.time.Clock;
import java.time.Instant;
import java.util.Optional;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

@Repository
public class MongoUserRepository implements UserRepository {

    private final MongoTemplate mongo;
    private final Clock clock;

    public MongoUserRepository(MongoTemplate mongo, Clock clock) {
        this.mongo = mongo;
        this.clock = clock;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return Optional.ofNullable(mongo.findOne(query(where("email").is(email)), UserDocument.class))
                .map(MongoUserRepository::toDomain);
    }

    @Override
    public User save(User user) {
        Instant now = clock.instant();
        String id = user.id() != null ? user.id() : MongoIds.newId();
        UserDocument saved = mongo.save(new UserDocument(id, user.email(), user.name(), user.image(),
                user.provider(), now, now));
        return toDomain(saved);
    }

    private static User toDomain(UserDocument doc) {
        return new User(doc.id(), doc.email(), doc.name(), doc.image(), doc.provider());
    }
}

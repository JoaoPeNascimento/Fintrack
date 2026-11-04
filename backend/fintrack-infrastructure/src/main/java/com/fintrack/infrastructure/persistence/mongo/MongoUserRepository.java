package com.fintrack.infrastructure.persistence.mongo;

import com.fintrack.domain.user.User;
import com.fintrack.domain.user.UserRepository;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
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

    /**
     * Upsert atômico ({@code findAndModify} + {@code $setOnInsert}). Depende do índice único em
     * {@code email} (ver {@link MongoConfig}): se duas inserções concorrentes colidirem, a perdedora
     * recebe {@link DuplicateKeyException} e passa a ler o documento já criado.
     */
    @Override
    public User findOrRegister(User candidate) {
        Query byEmail = query(where("email").is(candidate.email()));
        Instant now = clock.instant();
        Update insertOnly = new Update()
                .setOnInsert("name", candidate.name())
                .setOnInsert("image", candidate.image())
                .setOnInsert("provider", candidate.provider())
                .setOnInsert("createdAt", now)
                .setOnInsert("updatedAt", now);

        UserDocument doc;
        try {
            doc = mongo.findAndModify(byEmail, insertOnly,
                    FindAndModifyOptions.options().upsert(true).returnNew(true), UserDocument.class);
        } catch (DuplicateKeyException e) {
            doc = mongo.findOne(byEmail, UserDocument.class);
        }
        if (doc == null) {
            throw new IllegalStateException("Falha ao sincronizar o usuário " + candidate.email());
        }
        return toDomain(doc);
    }

    private static User toDomain(UserDocument doc) {
        return new User(doc.id(), doc.email(), doc.name(), doc.image(), doc.provider());
    }
}

package com.fintrack.infrastructure.persistence.mongo;

import com.fintrack.domain.share.ExpenseShare;
import com.fintrack.domain.share.ExpenseShareRepository;
import com.fintrack.domain.share.ShareMember;
import com.fintrack.domain.share.SharePermission;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Repository;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.springframework.data.mongodb.core.query.Criteria.where;
import static org.springframework.data.mongodb.core.query.Query.query;

@Repository
public class MongoExpenseShareRepository implements ExpenseShareRepository {

    private final MongoTemplate mongo;
    private final Clock clock;

    public MongoExpenseShareRepository(MongoTemplate mongo, Clock clock) {
        this.mongo = mongo;
        this.clock = clock;
    }

    /** Upsert por dono (índice único em {@code ownerId}); nunca sobrescreve a lista de membros. */
    @Override
    public ExpenseShare save(ExpenseShare share) {
        Instant now = clock.instant();
        Update update = new Update()
                .set("token", share.token())
                .set("permission", share.permission().name())
                .set("enabled", share.enabled())
                .set("updatedAt", now)
                .setOnInsert("members", List.of())
                .setOnInsert("createdAt", now);
        ExpenseShareDocument saved = mongo.findAndModify(byOwner(share.ownerId()), update,
                FindAndModifyOptions.options().upsert(true).returnNew(true), ExpenseShareDocument.class);
        if (saved == null) {
            throw new IllegalStateException("Falha ao salvar o compartilhamento de " + share.ownerId());
        }
        return toDomain(saved);
    }

    @Override
    public Optional<ExpenseShare> findByOwner(String ownerId) {
        return Optional.ofNullable(mongo.findOne(byOwner(ownerId), ExpenseShareDocument.class))
                .map(MongoExpenseShareRepository::toDomain);
    }

    @Override
    public Optional<ExpenseShare> findByToken(String token) {
        if (token == null || token.isBlank()) {
            return Optional.empty();
        }
        return Optional.ofNullable(mongo.findOne(query(where("token").is(token)), ExpenseShareDocument.class))
                .map(MongoExpenseShareRepository::toDomain);
    }

    @Override
    public List<ExpenseShare> findAllByMember(String userId) {
        return mongo.find(query(where("members.userId").is(userId)), ExpenseShareDocument.class).stream()
                .map(MongoExpenseShareRepository::toDomain)
                .toList();
    }

    /** {@code $push} condicionado à ausência do usuário: atômico e idempotente. */
    @Override
    public void addMember(String ownerId, ShareMember member) {
        Query notYetMember = query(where("ownerId").is(ownerId).and("members.userId").ne(member.userId()));
        mongo.updateFirst(notYetMember,
                new Update().push("members", new ExpenseShareDocument.Member(member.userId(), member.joinedAt())),
                ExpenseShareDocument.class);
    }

    @Override
    public boolean removeMember(String ownerId, String userId) {
        Query withMember = query(where("ownerId").is(ownerId).and("members.userId").is(userId));
        Update pull = new Update().pull("members", query(where("userId").is(userId)).getQueryObject());
        return mongo.updateFirst(withMember, pull, ExpenseShareDocument.class).getModifiedCount() > 0;
    }

    private static Query byOwner(String ownerId) {
        return query(where("ownerId").is(ownerId));
    }

    private static ExpenseShare toDomain(ExpenseShareDocument doc) {
        List<ShareMember> members = doc.members() == null ? List.of() : doc.members().stream()
                .map(m -> new ShareMember(m.userId(), m.joinedAt()))
                .toList();
        return ExpenseShare.restore(doc.id(), doc.ownerId(), doc.token(), SharePermission.valueOf(doc.permission()),
                Boolean.TRUE.equals(doc.enabled()), members);
    }
}

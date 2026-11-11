package com.fintrack.infrastructure.persistence.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

/** Um documento por dono, com os convidados embutidos. Ids de usuário gravados como String. */
@Document(ExpenseShareDocument.COLLECTION)
public record ExpenseShareDocument(@Id String id, String ownerId, String token, String permission, Boolean enabled,
                                   List<Member> members, Instant createdAt, Instant updatedAt) {

    public static final String COLLECTION = "expense_shares";

    public record Member(String userId, Instant joinedAt) {
    }
}

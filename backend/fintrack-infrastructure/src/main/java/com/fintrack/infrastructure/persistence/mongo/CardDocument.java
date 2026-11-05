package com.fintrack.infrastructure.persistence.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/** Coleção legada do Mongoose: aqui {@code userId} é gravado como String (nas demais, ObjectId). */
@Document(CardDocument.COLLECTION)
public record CardDocument(@Id String id, String name, Double limit, Integer closingDay, Integer dueDay,
                           String color, String userId, Instant createdAt, Instant updatedAt) {

    public static final String COLLECTION = "cards";
}

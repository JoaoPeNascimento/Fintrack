package com.fintrack.infrastructure.persistence.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

@Document(FixedExpenseDocument.COLLECTION)
public record FixedExpenseDocument(@Id String id, String name, String description, Double value,
                                   @Field(targetType = FieldType.OBJECT_ID) String userId,
                                   Instant createdAt, Instant updatedAt) {

    public static final String COLLECTION = "despesafixas";
}

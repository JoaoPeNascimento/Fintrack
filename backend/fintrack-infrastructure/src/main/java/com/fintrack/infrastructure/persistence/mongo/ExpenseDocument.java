package com.fintrack.infrastructure.persistence.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.Instant;

/** Documento da coleção legada {@code gastos}. A data representa um dia do calendário (meia-noite UTC). */
@Document(ExpenseDocument.COLLECTION)
public record ExpenseDocument(@Id String id, String name, String description, Double value, Instant date,
                              @Field("payment_method") String paymentMethod, Integer installments, String cardId,
                              @Field(targetType = FieldType.OBJECT_ID) String userId,
                              Instant createdAt, Instant updatedAt) {

    public static final String COLLECTION = "gastos";
}

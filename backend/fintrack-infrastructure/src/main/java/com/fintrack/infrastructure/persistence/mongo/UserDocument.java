package com.fintrack.infrastructure.persistence.mongo;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(UserDocument.COLLECTION)
public record UserDocument(@Id String id, String email, String name, String image, String provider,
                           Instant createdAt, Instant updatedAt) {

    public static final String COLLECTION = "users";
}

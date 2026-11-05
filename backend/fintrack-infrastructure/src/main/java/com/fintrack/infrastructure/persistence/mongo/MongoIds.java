package com.fintrack.infrastructure.persistence.mongo;

import org.bson.types.ObjectId;

final class MongoIds {

    private MongoIds() {
    }

    static String newId() {
        return new ObjectId().toHexString();
    }

    /** Ids inválidos nunca correspondem a um documento; evita erro de conversão vindo da URL. */
    static boolean isValid(String id) {
        return id != null && ObjectId.isValid(id);
    }
}

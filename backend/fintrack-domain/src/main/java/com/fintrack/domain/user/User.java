package com.fintrack.domain.user;

import com.fintrack.domain.shared.Guard;

/** Usuário autenticado via provedor OAuth (hoje apenas Google). */
public record User(String id, String email, String name, String image, String provider) {

    public static final String DEFAULT_PROVIDER = "google";

    public User {
        email = Guard.requireText(email, "O e-mail é obrigatório.");
        provider = provider == null ? DEFAULT_PROVIDER : provider;
    }

    public static User register(String email, String name, String image) {
        return new User(null, email, name, image, DEFAULT_PROVIDER);
    }
}

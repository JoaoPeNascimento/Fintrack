package com.fintrack.application.user;

import com.fintrack.domain.user.User;
import com.fintrack.domain.user.UserRepository;

/** Busca o usuário pelo e-mail do token e o cadastra no primeiro acesso. */
public class SyncAuthenticatedUser {

    private final UserRepository users;

    public SyncAuthenticatedUser(UserRepository users) {
        this.users = users;
    }

    public User execute(String email, String name, String image) {
        return users.findByEmail(email)
                .orElseGet(() -> users.save(User.register(email, name, image)));
    }
}

package com.fintrack.domain.user;

import java.util.Optional;

public interface UserRepository {

    Optional<User> findByEmail(String email);

    User save(User user);

    /**
     * Retorna o usuário com o e-mail do candidato, cadastrando-o se ainda não existir.
     * Deve ser atômico: chamadas concorrentes para o mesmo e-mail resultam em um único usuário.
     */
    User findOrRegister(User candidate);
}

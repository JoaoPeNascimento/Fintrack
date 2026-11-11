package com.fintrack.domain.user;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository {

    Optional<User> findByEmail(String email);

    /** Usuários com os ids informados; ids inexistentes são ignorados (ordem não garantida). */
    List<User> findAllByIds(Collection<String> ids);

    User save(User user);

    /**
     * Retorna o usuário com o e-mail do candidato, cadastrando-o se ainda não existir.
     * Deve ser atômico: chamadas concorrentes para o mesmo e-mail resultam em um único usuário.
     */
    User findOrRegister(User candidate);
}

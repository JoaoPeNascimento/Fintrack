package com.fintrack.domain.card;

import java.util.List;
import java.util.Optional;

public interface CardRepository {

    Card save(Card card);

    /** Cartões do usuário, do mais recente para o mais antigo. */
    List<Card> findAllByUser(String userId);

    Optional<Card> findByIdAndUser(String id, String userId);

    boolean existsByIdAndUser(String id, String userId);

    /** @return false se o cartão não existir ou não pertencer ao usuário */
    boolean deleteByIdAndUser(String id, String userId);
}

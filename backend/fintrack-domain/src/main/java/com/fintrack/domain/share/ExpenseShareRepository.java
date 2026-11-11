package com.fintrack.domain.share;

import java.util.List;
import java.util.Optional;

/**
 * Persistência dos compartilhamentos. {@link #save} grava apenas a configuração (token, regra, status);
 * a lista de membros muda só por {@link #addMember}/{@link #removeMember}, que devem ser atômicos para
 * que um convidado entrando ao mesmo tempo em que o dono altera a regra não se perca.
 */
public interface ExpenseShareRepository {

    /** Cria (um por dono) ou atualiza a configuração do compartilhamento. */
    ExpenseShare save(ExpenseShare share);

    Optional<ExpenseShare> findByOwner(String ownerId);

    Optional<ExpenseShare> findByToken(String token);

    /** Compartilhamentos (habilitados ou não) dos quais o usuário é membro. */
    List<ExpenseShare> findAllByMember(String userId);

    /** Adiciona o membro se ele ainda não fizer parte do compartilhamento do dono. */
    void addMember(String ownerId, ShareMember member);

    /** @return false se o usuário não era membro */
    boolean removeMember(String ownerId, String userId);
}

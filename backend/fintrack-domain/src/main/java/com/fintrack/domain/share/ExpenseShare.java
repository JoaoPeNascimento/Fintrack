package com.fintrack.domain.share;

import com.fintrack.domain.shared.Guard;
import com.fintrack.domain.shared.ValidationException;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Compartilhamento dos gastos, cartões e despesas fixas de um usuário. Cada dono tem um único link
 * (token) e uma única regra, que vale para todos os convidados.
 */
public final class ExpenseShare {

    private final String id;
    private final String ownerId;
    private String token;
    private SharePermission permission;
    private boolean enabled;
    private final List<ShareMember> members;

    private ExpenseShare(String id, String ownerId, String token, SharePermission permission, boolean enabled,
                         List<ShareMember> members) {
        this.id = id;
        this.ownerId = Guard.requireText(ownerId, "Identificador de usuário é obrigatório");
        this.token = Guard.requireText(token, "O token do compartilhamento é obrigatório");
        this.permission = Guard.requireNonNull(permission, "Informe a regra de compartilhamento.");
        this.enabled = enabled;
        this.members = new ArrayList<>(members == null ? List.of() : members);
    }

    public static ExpenseShare create(String ownerId, SharePermission permission, String token) {
        return new ExpenseShare(null, ownerId, token, permission, true, List.of());
    }

    /** Reconstrói um compartilhamento já persistido. */
    public static ExpenseShare restore(String id, String ownerId, String token, SharePermission permission,
                                       boolean enabled, List<ShareMember> members) {
        return new ExpenseShare(id, ownerId, token, permission, enabled, members);
    }

    public void configure(SharePermission permission, boolean enabled) {
        this.permission = Guard.requireNonNull(permission, "Informe a regra de compartilhamento.");
        this.enabled = enabled;
    }

    /** Invalida o link atual; os membros continuam com acesso. */
    public void regenerateToken(String token) {
        this.token = Guard.requireText(token, "O token do compartilhamento é obrigatório");
    }

    /**
     * Adiciona o convidado e devolve o membro. Idempotente: entrar de novo devolve o membro existente,
     * sem alterar a data de entrada.
     */
    public ShareMember join(String userId, Instant now) {
        Guard.requireText(userId, "Identificador de usuário é obrigatório");
        if (userId.equals(ownerId)) {
            throw new ValidationException("Você não pode aceitar o próprio compartilhamento.");
        }
        if (!enabled) {
            throw new ValidationException("Este compartilhamento está desativado.");
        }
        return members.stream().filter(m -> m.userId().equals(userId)).findFirst().orElseGet(() -> {
            ShareMember member = new ShareMember(userId, now);
            members.add(member);
            return member;
        });
    }

    /** @return false se o usuário não era membro */
    public boolean removeMember(String userId) {
        return members.removeIf(m -> m.userId().equals(userId));
    }

    public boolean isMember(String userId) {
        return members.stream().anyMatch(m -> m.userId().equals(userId));
    }

    /** Membro com o compartilhamento habilitado. */
    public boolean grantsAccessTo(String userId) {
        return enabled && isMember(userId);
    }

    public String id() {
        return id;
    }

    public String ownerId() {
        return ownerId;
    }

    public String token() {
        return token;
    }

    public SharePermission permission() {
        return permission;
    }

    public boolean enabled() {
        return enabled;
    }

    public List<ShareMember> members() {
        return List.copyOf(members);
    }
}

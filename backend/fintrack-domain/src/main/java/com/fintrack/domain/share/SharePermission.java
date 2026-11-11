package com.fintrack.domain.share;

import com.fintrack.domain.shared.ValidationException;

/** Regra definida pelo dono para todos os convidados. */
public enum SharePermission {
    /** Só visualizar. */
    VIEW_ONLY,
    /** Visualizar e adicionar gastos variáveis. */
    ADD_EXPENSES,
    /** Visualizar e editar tudo: gastos, despesas fixas e cartões. */
    EDIT_ALL;

    public boolean allows(ShareAction action) {
        return switch (action) {
            case VIEW -> true;
            case CREATE_EXPENSE -> this != VIEW_ONLY;
            case MODIFY_EXPENSE, MANAGE_CARDS_AND_FIXED -> this == EDIT_ALL;
        };
    }

    public static SharePermission from(String value) {
        if (value == null || value.isBlank()) {
            throw new ValidationException("Informe a regra de compartilhamento.");
        }
        try {
            return SharePermission.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ValidationException("Regra de compartilhamento inválida: " + value);
        }
    }
}

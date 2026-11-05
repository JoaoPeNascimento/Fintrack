package com.fintrack.domain.shared;

/** Erro de regra de negócio. A mensagem é exibida ao usuário (PT-BR). */
public class DomainException extends RuntimeException {

    public DomainException(String message) {
        super(message);
    }
}

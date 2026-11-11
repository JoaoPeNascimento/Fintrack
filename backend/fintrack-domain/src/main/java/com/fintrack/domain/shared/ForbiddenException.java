package com.fintrack.domain.shared;

/** O usuário tem acesso ao recurso, mas não pode executar esta ação. */
public class ForbiddenException extends DomainException {

    public ForbiddenException(String message) {
        super(message);
    }
}

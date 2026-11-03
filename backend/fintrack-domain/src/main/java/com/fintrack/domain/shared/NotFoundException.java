package com.fintrack.domain.shared;

/** Recurso inexistente ou pertencente a outro usuário. */
public class NotFoundException extends DomainException {

    public NotFoundException(String message) {
        super(message);
    }
}

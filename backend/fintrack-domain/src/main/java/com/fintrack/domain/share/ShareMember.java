package com.fintrack.domain.share;

import java.time.Instant;

/** Usuário que aceitou o convite de compartilhamento. */
public record ShareMember(String userId, Instant joinedAt) {
}

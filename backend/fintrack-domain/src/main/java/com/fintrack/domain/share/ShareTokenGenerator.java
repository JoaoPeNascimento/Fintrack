package com.fintrack.domain.share;

/** Gera tokens imprevisíveis para os links de compartilhamento. */
@FunctionalInterface
public interface ShareTokenGenerator {

    String newToken();
}

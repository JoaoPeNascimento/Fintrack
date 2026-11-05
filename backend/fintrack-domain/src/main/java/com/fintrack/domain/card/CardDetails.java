package com.fintrack.domain.card;

import java.math.BigDecimal;

/** Dados editáveis de um cartão, como recebidos do usuário (ainda não validados). */
public record CardDetails(String name, BigDecimal limit, Integer closingDay, Integer dueDay, String color) {
}

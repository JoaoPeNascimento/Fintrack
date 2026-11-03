package com.fintrack.domain.expense;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Dados de um gasto como informados pelo usuário.
 *
 * @param value        valor total informado no formulário
 * @param date         data da compra; quando nula usa-se a data atual
 * @param installments número de parcelas; quando nulo assume 1
 * @param cardId       cartão utilizado, relevante apenas para {@link PaymentMethod#CARTAO}
 */
public record ExpenseDetails(String name, String description, BigDecimal value, LocalDate date,
                             PaymentMethod paymentMethod, Integer installments, String cardId) {
}

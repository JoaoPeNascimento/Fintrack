package com.fintrack.domain.expense;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ExpenseRepository {

    Expense save(Expense expense);

    Optional<Expense> findByIdAndUser(String id, String userId);

    /** Todos os gastos do usuário, por data decrescente. */
    List<Expense> findAllByUser(String userId);

    /** Gastos com data entre {@code start} e {@code end} (inclusive), por data decrescente. */
    List<Expense> findByUserAndDateBetween(String userId, LocalDate start, LocalDate end);

    /** Totais agrupados por ano/mês da data do gasto (ordem não garantida). */
    List<MonthlyTotal> sumByMonth(String userId);

    boolean deleteByIdAndUser(String id, String userId);

    /** Remove o vínculo dos gastos do usuário com o cartão (a forma de pagamento continua CARTAO). */
    void unlinkCard(String userId, String cardId);
}

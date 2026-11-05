package com.fintrack.domain.fixedexpense;

import java.util.List;
import java.util.Optional;

public interface FixedExpenseRepository {

    FixedExpense save(FixedExpense expense);

    /** Despesas fixas do usuário, da mais recente para a mais antiga. */
    List<FixedExpense> findAllByUser(String userId);

    Optional<FixedExpense> findByIdAndUser(String id, String userId);

    boolean deleteByIdAndUser(String id, String userId);
}

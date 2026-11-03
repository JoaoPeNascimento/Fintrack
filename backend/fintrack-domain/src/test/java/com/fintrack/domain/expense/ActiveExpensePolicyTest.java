package com.fintrack.domain.expense;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.LocalDate;
import java.time.YearMonth;

import static org.assertj.core.api.Assertions.assertThat;

class ActiveExpensePolicyTest {

    private static final YearMonth CURRENT = YearMonth.of(2026, 3);

    @ParameterizedTest(name = "{0} em {1}x -> ativo={2}")
    @CsvSource({
            // mês atual e futuro sempre entram
            "2026-03-01, 1, true",
            "2026-03-31, 1, true",
            "2026-05-10, 1, true",
            // à vista de meses anteriores não entram
            "2026-02-28, 1, false",
            // compra em 3x: visível nos meses 0, 1 e 2; oculta no mês 3
            "2026-02-10, 3, true",
            "2026-01-10, 3, true",
            "2025-12-10, 3, false",
            // virada de ano
            "2025-12-10, 12, true",
            "2025-03-10, 12, false",
    })
    void decidesWhetherExpenseBelongsToCurrentMonth(LocalDate date, int installments, boolean expected) {
        assertThat(ActiveExpensePolicy.isActive(date, installments, CURRENT)).isEqualTo(expected);
    }
}

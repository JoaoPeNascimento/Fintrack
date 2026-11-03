package com.fintrack.domain.expense;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class MonthlySummaryTest {

    @Test
    void buildsPortugueseLabels() {
        MonthlySummary summary = MonthlySummary.of(new MonthlyTotal(2026, 3, new BigDecimal("150.50"), 4));

        assertThat(summary.label()).isEqualTo("Março 2026");
        assertThat(summary.shortLabel()).isEqualTo("03/2026");
        assertThat(summary.totalAmount()).isEqualByComparingTo("150.50");
        assertThat(summary.expenseCount()).isEqualTo(4);
    }
}

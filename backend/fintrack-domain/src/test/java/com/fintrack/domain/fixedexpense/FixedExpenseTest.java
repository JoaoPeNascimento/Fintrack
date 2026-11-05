package com.fintrack.domain.fixedexpense;

import com.fintrack.domain.shared.ValidationException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class FixedExpenseTest {

    @Test
    void createsAndUpdates() {
        FixedExpense expense = FixedExpense.create("user-1", new FixedExpenseDetails(" Aluguel ", null, new BigDecimal("1200")));

        expense.update(new FixedExpenseDetails("Aluguel", "Apto", new BigDecimal("1300")));

        assertThat(expense.name()).isEqualTo("Aluguel");
        assertThat(expense.description()).isEqualTo("Apto");
        assertThat(expense.value()).isEqualByComparingTo("1300");
    }

    @Test
    void rejectsNegativeValue() {
        assertThatThrownBy(() -> FixedExpense.create("user-1", new FixedExpenseDetails("Luz", null, new BigDecimal("-1"))))
                .isInstanceOf(ValidationException.class)
                .hasMessage("O valor não pode ser negativo.");
    }
}

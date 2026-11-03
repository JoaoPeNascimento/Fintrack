package com.fintrack.domain.expense;

import com.fintrack.domain.shared.ValidationException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExpenseTest {

    private static final LocalDate TODAY = LocalDate.of(2026, 3, 15);

    private static ExpenseDetails details(String value, PaymentMethod method, Integer installments) {
        return new ExpenseDetails("Notebook", null, new BigDecimal(value), LocalDate.of(2026, 3, 10),
                method, installments, "card-1");
    }

    @Test
    void createDividesCardPurchaseByInstallments() {
        Expense expense = Expense.create("user-1", details("300", PaymentMethod.CARTAO, 3), TODAY);

        assertThat(expense.value()).isEqualByComparingTo("100");
        assertThat(expense.installments()).isEqualTo(3);
        assertThat(expense.cardId()).isEqualTo("card-1");
    }

    @Test
    void createKeepsValueForNonCardPayments() {
        Expense expense = Expense.create("user-1", details("300", PaymentMethod.PIX, 3), TODAY);

        assertThat(expense.value()).isEqualByComparingTo("300");
        assertThat(expense.cardId()).isNull();
    }

    @Test
    void updateDoesNotDivideAgain() {
        Expense expense = Expense.create("user-1", details("300", PaymentMethod.CARTAO, 3), TODAY);

        expense.update(details("100", PaymentMethod.CARTAO, 3), TODAY);

        assertThat(expense.value()).isEqualByComparingTo("100");
    }

    @Test
    void defaultsDateToTodayAndInstallmentsToOne() {
        ExpenseDetails d = new ExpenseDetails("Café", null, new BigDecimal("5"), null, PaymentMethod.DINHEIRO, null, null);

        Expense expense = Expense.create("user-1", d, TODAY);

        assertThat(expense.date()).isEqualTo(TODAY);
        assertThat(expense.installments()).isEqualTo(1);
    }

    @Test
    void trimsNameAndDescription() {
        ExpenseDetails d = new ExpenseDetails("  Mercado ", "  ", new BigDecimal("50"), null, PaymentMethod.PIX, 1, null);

        Expense expense = Expense.create("user-1", d, TODAY);

        assertThat(expense.name()).isEqualTo("Mercado");
        assertThat(expense.description()).isNull();
    }

    @Test
    void rejectsInvalidData() {
        assertThatThrownBy(() -> Expense.create("user-1", details("-1", PaymentMethod.PIX, 1), TODAY))
                .isInstanceOf(ValidationException.class);
        assertThatThrownBy(() -> Expense.create("user-1", details("10", PaymentMethod.PIX, 0), TODAY))
                .isInstanceOf(ValidationException.class);
        assertThatThrownBy(() -> Expense.create("user-1", details("10", null, 1), TODAY))
                .isInstanceOf(ValidationException.class);
        assertThatThrownBy(() -> Expense.create("user-1",
                new ExpenseDetails(" ", null, BigDecimal.ONE, null, PaymentMethod.PIX, 1, null), TODAY))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void parsesPaymentMethod() {
        assertThat(PaymentMethod.from("pix")).isEqualTo(PaymentMethod.PIX);
        assertThatThrownBy(() -> PaymentMethod.from("BOLETO")).isInstanceOf(ValidationException.class);
    }
}

package com.fintrack.application.expense;

import com.fintrack.application.InMemoryRepositories;
import com.fintrack.application.card.DeleteCard;
import com.fintrack.domain.card.Card;
import com.fintrack.domain.card.CardDetails;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseDetails;
import com.fintrack.domain.expense.MonthlySummary;
import com.fintrack.domain.expense.PaymentMethod;
import com.fintrack.domain.shared.NotFoundException;
import com.fintrack.domain.shared.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExpenseUseCasesTest {

    private static final String USER = "user-1";
    private static final String OTHER_USER = "user-2";

    // 04:00 UTC = 01:00 de 1º de março de 2026 em São Paulo
    private final Clock clock = Clock.fixed(Instant.parse("2026-03-01T04:00:00Z"), ZoneId.of("America/Sao_Paulo"));

    private InMemoryRepositories.Expenses expenses;
    private InMemoryRepositories.Cards cards;
    private CreateExpense createExpense;

    @BeforeEach
    void setUp() {
        expenses = new InMemoryRepositories.Expenses();
        cards = new InMemoryRepositories.Cards();
        createExpense = new CreateExpense(expenses, cards, clock);
    }

    private ExpenseDetails purchase(String name, String value, LocalDate date, PaymentMethod method,
                                    int installments, String cardId) {
        return new ExpenseDetails(name, null, new BigDecimal(value), date, method, installments, cardId);
    }

    @Test
    void listsCurrentMonthAndOpenInstallments() {
        Card card = cards.save(Card.create(USER, new CardDetails("Nubank", BigDecimal.TEN, 1, 10, "purple")));
        createExpense.execute(USER, purchase("Mercado", "100", LocalDate.of(2026, 3, 1), PaymentMethod.PIX, 1, null));
        createExpense.execute(USER, purchase("Antigo", "50", LocalDate.of(2026, 2, 20), PaymentMethod.PIX, 1, null));
        createExpense.execute(USER, purchase("TV 3x", "300", LocalDate.of(2026, 1, 5), PaymentMethod.CARTAO, 3, card.id()));
        createExpense.execute(USER, purchase("Celular 2x", "200", LocalDate.of(2026, 1, 5), PaymentMethod.CARTAO, 2, card.id()));
        createExpense.execute(OTHER_USER, purchase("Outro", "10", LocalDate.of(2026, 3, 2), PaymentMethod.PIX, 1, null));

        List<Expense> active = new ListActiveExpenses(expenses, clock).execute(USER);

        assertThat(active).extracting(Expense::name).containsExactly("Mercado", "TV 3x");
        assertThat(active.get(1).value()).isEqualByComparingTo("100");
    }

    @Test
    void defaultsDateToTodayInConfiguredZone() {
        Expense created = createExpense.execute(USER, purchase("Café", "5", null, PaymentMethod.DINHEIRO, 1, null));

        assertThat(created.date()).isEqualTo(LocalDate.of(2026, 3, 1));
    }

    @Test
    void rejectsCardFromAnotherUser() {
        Card foreign = cards.save(Card.create(OTHER_USER, new CardDetails("Itaú", BigDecimal.TEN, 1, 10, "blue")));

        assertThatThrownBy(() -> createExpense.execute(USER,
                purchase("TV", "100", null, PaymentMethod.CARTAO, 1, foreign.id())))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void updateAndDeleteRespectOwnership() {
        Expense created = createExpense.execute(USER, purchase("Mercado", "100", null, PaymentMethod.PIX, 1, null));
        UpdateExpense update = new UpdateExpense(expenses, cards, clock);
        DeleteExpense delete = new DeleteExpense(expenses);

        assertThatThrownBy(() -> update.execute(OTHER_USER, created.id(),
                purchase("Hack", "1", null, PaymentMethod.PIX, 1, null)))
                .isInstanceOf(NotFoundException.class);
        assertThatThrownBy(() -> delete.execute(OTHER_USER, created.id()))
                .isInstanceOf(NotFoundException.class);

        Expense updated = update.execute(USER, created.id(), purchase("Mercado", "120", null, PaymentMethod.PIX, 1, null));
        assertThat(updated.value()).isEqualByComparingTo("120");

        delete.execute(USER, created.id());
        assertThat(expenses.findAllByUser(USER)).isEmpty();
    }

    @Test
    void deletingCardUnlinksItsExpensesAndTheyStayEditable() {
        Card card = cards.save(Card.create(USER, new CardDetails("Nubank", BigDecimal.TEN, 1, 10, "purple")));
        Expense tv = createExpense.execute(USER, purchase("TV", "300", LocalDate.of(2026, 3, 1), PaymentMethod.CARTAO, 3, card.id()));

        new DeleteCard(cards, expenses).execute(USER, card.id());

        Expense unlinked = expenses.findByIdAndUser(tv.id(), USER).orElseThrow();
        assertThat(unlinked.cardId()).isNull();
        assertThat(unlinked.paymentMethod()).isEqualTo(PaymentMethod.CARTAO);
        assertThat(unlinked.installments()).isEqualTo(3);

        Expense renamed = new UpdateExpense(expenses, cards, clock).execute(USER, tv.id(),
                purchase("TV Sala", "100", LocalDate.of(2026, 3, 1), PaymentMethod.CARTAO, 3, null));
        assertThat(renamed.name()).isEqualTo("TV Sala");
    }

    @Test
    void expenseStillPointingToRemovedCardCanBeEditedButNotMovedToForeignCard() {
        // Dado legado: gasto que aponta para um cartão removido antes do desvínculo automático.
        Expense orphan = expenses.save(Expense.restore(null, USER, "TV", null, new BigDecimal("100"),
                LocalDate.of(2026, 3, 1), PaymentMethod.CARTAO, 3, "removed-card", null));
        Card foreign = cards.save(Card.create(OTHER_USER, new CardDetails("Itaú", BigDecimal.TEN, 1, 10, "blue")));
        UpdateExpense update = new UpdateExpense(expenses, cards, clock);

        Expense renamed = update.execute(USER, orphan.id(),
                purchase("TV Sala", "100", LocalDate.of(2026, 3, 1), PaymentMethod.CARTAO, 3, "removed-card"));
        assertThat(renamed.name()).isEqualTo("TV Sala");

        assertThatThrownBy(() -> update.execute(USER, orphan.id(),
                purchase("TV Sala", "100", LocalDate.of(2026, 3, 1), PaymentMethod.CARTAO, 3, foreign.id())))
                .isInstanceOf(ValidationException.class);
    }

    @Test
    void listsExpensesOfGivenMonthAndSummarizesHistory() {
        createExpense.execute(USER, purchase("A", "10", LocalDate.of(2026, 1, 1), PaymentMethod.PIX, 1, null));
        createExpense.execute(USER, purchase("B", "20", LocalDate.of(2026, 1, 31), PaymentMethod.PIX, 1, null));
        createExpense.execute(USER, purchase("C", "5", LocalDate.of(2025, 12, 31), PaymentMethod.PIX, 1, null));

        List<Expense> january = new ListExpensesByMonth(expenses).execute(USER, 1, 2026);
        List<MonthlySummary> history = new GetMonthlySummary(expenses).execute(USER);

        assertThat(january).extracting(Expense::name).containsExactly("B", "A");
        assertThat(history).extracting(MonthlySummary::shortLabel).containsExactly("01/2026", "12/2025");
        assertThat(history.get(0).totalAmount()).isEqualByComparingTo("30");
        assertThat(history.get(0).expenseCount()).isEqualTo(2);
    }

    @Test
    void rejectsInvalidMonth() {
        assertThatThrownBy(() -> new ListExpensesByMonth(expenses).execute(USER, 13, 2026))
                .isInstanceOf(ValidationException.class);
    }
}

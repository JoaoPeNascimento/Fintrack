package com.fintrack.application.card;

import com.fintrack.application.InMemoryRepositories;
import com.fintrack.domain.card.Card;
import com.fintrack.domain.card.CardDetails;
import com.fintrack.domain.shared.NotFoundException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CardUseCasesTest {

    private final InMemoryRepositories.Cards cards = new InMemoryRepositories.Cards();
    private final InMemoryRepositories.Expenses expenses = new InMemoryRepositories.Expenses();

    @Test
    void createUpdateAndDelete() {
        Card card = new CreateCard(cards).execute("user-1", new CardDetails("Nubank", new BigDecimal("1000"), 3, 10, "purple"));

        Card updated = new UpdateCard(cards).execute("user-1", card.id(),
                new CardDetails("Nubank Ultravioleta", new BigDecimal("2000"), 5, 12, "black"));

        assertThat(updated.name()).isEqualTo("Nubank Ultravioleta");
        assertThat(new ListCards(cards).execute("user-1")).hasSize(1);

        new DeleteCard(cards, expenses).execute("user-1", card.id());
        assertThat(new ListCards(cards).execute("user-1")).isEmpty();
    }

    @Test
    void otherUsersCannotTouchCard() {
        Card card = new CreateCard(cards).execute("user-1", new CardDetails("Nubank", BigDecimal.TEN, 3, 10, "purple"));

        assertThatThrownBy(() -> new UpdateCard(cards).execute("user-2", card.id(),
                new CardDetails("X", BigDecimal.ONE, 1, 1, "red")))
                .isInstanceOf(NotFoundException.class)
                .hasMessage("Cartão não encontrado ou sem permissão para editar.");
        assertThatThrownBy(() -> new DeleteCard(cards, expenses).execute("user-2", card.id()))
                .hasMessage("Cartão não encontrado ou sem permissão para deletar.");
    }
}

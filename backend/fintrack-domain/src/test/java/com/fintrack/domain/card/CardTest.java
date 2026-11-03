package com.fintrack.domain.card;

import com.fintrack.domain.shared.ValidationException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CardTest {

    @Test
    void createsValidCard() {
        Card card = Card.create("user-1", new CardDetails("Nubank", new BigDecimal("5000"), 3, 10, "purple"));

        assertThat(card.name()).isEqualTo("Nubank");
        assertThat(card.closingDay()).isEqualTo(3);
        assertThat(card.dueDay()).isEqualTo(10);
    }

    @Test
    void requiresAllFields() {
        assertThatThrownBy(() -> Card.create("user-1", new CardDetails("", BigDecimal.TEN, 1, 1, "red")))
                .isInstanceOf(ValidationException.class)
                .hasMessage("O nome do cartão é obrigatório");
        assertThatThrownBy(() -> Card.create("user-1", new CardDetails("X", null, 1, 1, "red")))
                .hasMessage("O limite do cartão é obrigatório");
        assertThatThrownBy(() -> Card.create("user-1", new CardDetails("X", BigDecimal.TEN, null, 1, "red")))
                .hasMessage("O dia de fechamento é obrigatório");
        assertThatThrownBy(() -> Card.create("user-1", new CardDetails("X", BigDecimal.TEN, 1, 32, "red")))
                .hasMessage("O dia de vencimento deve estar entre 1 e 31");
        assertThatThrownBy(() -> Card.create("user-1", new CardDetails("X", BigDecimal.TEN, 1, 1, null)))
                .hasMessage("A cor do cartão é obrigatória");
    }
}

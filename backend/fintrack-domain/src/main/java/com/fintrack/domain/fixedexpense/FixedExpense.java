package com.fintrack.domain.fixedexpense;

import com.fintrack.domain.shared.Guard;

import java.math.BigDecimal;
import java.time.Instant;

/** Despesa recorrente mensal (aluguel, assinaturas...). */
public final class FixedExpense {

    private final String id;
    private final String userId;
    private final Instant createdAt;
    private String name;
    private String description;
    private BigDecimal value;

    private FixedExpense(String id, String userId, Instant createdAt) {
        this.id = id;
        this.userId = Guard.requireText(userId, "A despesa fixa deve pertencer a um usuário.");
        this.createdAt = createdAt;
    }

    public static FixedExpense create(String userId, FixedExpenseDetails details) {
        FixedExpense expense = new FixedExpense(null, userId, null);
        expense.apply(details);
        return expense;
    }

    public static FixedExpense restore(String id, String userId, String name, String description,
                                       BigDecimal value, Instant createdAt) {
        FixedExpense expense = new FixedExpense(id, userId, createdAt);
        expense.name = name;
        expense.description = description;
        expense.value = value;
        return expense;
    }

    public void update(FixedExpenseDetails details) {
        apply(details);
    }

    private void apply(FixedExpenseDetails details) {
        Guard.requireNonNull(details, "Os dados da despesa fixa são obrigatórios.");
        this.name = Guard.requireText(details.name(), "Informe o nome da despesa fixa.");
        this.description = Guard.optionalText(details.description());
        this.value = Guard.requireNonNegative(details.value(),
                "Informe o valor da despesa fixa.", "O valor não pode ser negativo.");
    }

    public String id() {
        return id;
    }

    public String userId() {
        return userId;
    }

    public String name() {
        return name;
    }

    public String description() {
        return description;
    }

    public BigDecimal value() {
        return value;
    }

    public Instant createdAt() {
        return createdAt;
    }
}

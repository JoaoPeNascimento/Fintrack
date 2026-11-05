package com.fintrack.domain.expense;

import com.fintrack.domain.shared.Guard;
import com.fintrack.domain.shared.ValidationException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;

/** Gasto variável (compra pontual, à vista ou parcelada). */
public final class Expense {

    private final String id;
    private final String userId;
    private final Instant createdAt;
    private String name;
    private String description;
    private BigDecimal value;
    private LocalDate date;
    private PaymentMethod paymentMethod;
    private int installments;
    private String cardId;

    private Expense(String id, String userId, Instant createdAt) {
        this.id = id;
        this.userId = Guard.requireText(userId, "O gasto deve pertencer a um usuário.");
        this.createdAt = createdAt;
    }

    /** Novo gasto. Compras parceladas no cartão são gravadas pelo valor da parcela. */
    public static Expense create(String userId, ExpenseDetails details, LocalDate today) {
        Expense expense = new Expense(null, userId, null);
        expense.apply(details, today);
        expense.value = InstallmentSplitPolicy.valuePerInstallment(
                expense.value, expense.paymentMethod, expense.installments);
        return expense;
    }

    public static Expense restore(String id, String userId, String name, String description, BigDecimal value,
                                  LocalDate date, PaymentMethod paymentMethod, int installments, String cardId,
                                  Instant createdAt) {
        Expense expense = new Expense(id, userId, createdAt);
        expense.name = name;
        expense.description = description;
        expense.value = value;
        expense.date = date;
        expense.paymentMethod = paymentMethod;
        expense.installments = installments;
        expense.cardId = cardId;
        return expense;
    }

    /** Edição: o valor informado é gravado como está (sem nova divisão por parcelas). */
    public void update(ExpenseDetails details, LocalDate today) {
        apply(details, today);
    }

    public boolean isActiveIn(YearMonth current) {
        return ActiveExpensePolicy.isActive(date, installments, current);
    }

    private void apply(ExpenseDetails details, LocalDate today) {
        Guard.requireNonNull(details, "Os dados do gasto são obrigatórios.");
        this.name = Guard.requireText(details.name(), "Informe o nome do gasto.");
        this.description = Guard.optionalText(details.description());
        this.value = Guard.requireNonNegative(details.value(),
                "Informe o valor do gasto.", "O valor não pode ser negativo.");
        this.date = details.date() != null ? details.date() : today;
        this.paymentMethod = Guard.requireNonNull(details.paymentMethod(), "Informe a forma de pagamento.");

        int parsedInstallments = details.installments() == null ? 1 : details.installments();
        if (parsedInstallments < 1) {
            throw new ValidationException("É necessário ao menos 1 parcela.");
        }
        this.installments = parsedInstallments;
        this.cardId = paymentMethod == PaymentMethod.CARTAO ? Guard.optionalText(details.cardId()) : null;
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

    public LocalDate date() {
        return date;
    }

    public PaymentMethod paymentMethod() {
        return paymentMethod;
    }

    public int installments() {
        return installments;
    }

    public String cardId() {
        return cardId;
    }

    public Instant createdAt() {
        return createdAt;
    }
}

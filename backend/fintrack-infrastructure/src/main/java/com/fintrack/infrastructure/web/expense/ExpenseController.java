package com.fintrack.infrastructure.web.expense;

import com.fintrack.application.expense.CreateExpense;
import com.fintrack.application.expense.DeleteExpense;
import com.fintrack.application.expense.GetMonthlySummary;
import com.fintrack.application.expense.ListActiveExpenses;
import com.fintrack.application.expense.ListExpensesByMonth;
import com.fintrack.application.expense.UpdateExpense;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseDetails;
import com.fintrack.domain.expense.MonthlySummary;
import com.fintrack.domain.expense.PaymentMethod;
import com.fintrack.infrastructure.web.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/expenses")
public class ExpenseController {

    private static final String CARD_PREFIX = "CARD_";

    /**
     * @param paymentMethod CARTAO, PIX ou DINHEIRO. Por compatibilidade com o formulário atual,
     *                      também aceita {@code CARD_<id>}, equivalente a CARTAO + {@code cardId}.
     */
    public record ExpenseRequest(String name, String description, BigDecimal value, LocalDate date,
                                 String paymentMethod, Integer installments, String cardId) {

        ExpenseDetails toDetails() {
            String method = paymentMethod;
            String card = cardId;
            if (method != null && method.startsWith(CARD_PREFIX)) {
                card = method.substring(CARD_PREFIX.length());
                method = PaymentMethod.CARTAO.name();
            }
            return new ExpenseDetails(name, description, value, date, PaymentMethod.from(method), installments, card);
        }
    }

    public record ExpenseResponse(String id, String name, String description, BigDecimal value, LocalDate date,
                                  PaymentMethod paymentMethod, int installments, String cardId) {

        static ExpenseResponse from(Expense e) {
            return new ExpenseResponse(e.id(), e.name(), e.description(), e.value(), e.date(),
                    e.paymentMethod(), e.installments(), e.cardId());
        }
    }

    private final CreateExpense createExpense;
    private final UpdateExpense updateExpense;
    private final DeleteExpense deleteExpense;
    private final ListActiveExpenses listActiveExpenses;
    private final ListExpensesByMonth listExpensesByMonth;
    private final GetMonthlySummary getMonthlySummary;

    public ExpenseController(CreateExpense createExpense, UpdateExpense updateExpense, DeleteExpense deleteExpense,
                             ListActiveExpenses listActiveExpenses, ListExpensesByMonth listExpensesByMonth,
                             GetMonthlySummary getMonthlySummary) {
        this.createExpense = createExpense;
        this.updateExpense = updateExpense;
        this.deleteExpense = deleteExpense;
        this.listActiveExpenses = listActiveExpenses;
        this.listExpensesByMonth = listExpensesByMonth;
        this.getMonthlySummary = getMonthlySummary;
    }

    /** Gastos do mês corrente, incluindo parcelas em aberto de meses anteriores (dashboard). */
    @GetMapping("/active")
    public List<ExpenseResponse> active(@CurrentUser String userId) {
        return toResponses(listActiveExpenses.execute(userId));
    }

    @GetMapping
    public List<ExpenseResponse> byMonth(@CurrentUser String userId, @RequestParam int month, @RequestParam int year) {
        return toResponses(listExpensesByMonth.execute(userId, month, year));
    }

    @GetMapping("/monthly-summary")
    public List<MonthlySummary> monthlySummary(@CurrentUser String userId) {
        return getMonthlySummary.execute(userId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(@CurrentUser String userId, @RequestBody ExpenseRequest request) {
        return ExpenseResponse.from(createExpense.execute(userId, request.toDetails()));
    }

    @PutMapping("/{id}")
    public ExpenseResponse update(@CurrentUser String userId, @PathVariable String id,
                                  @RequestBody ExpenseRequest request) {
        return ExpenseResponse.from(updateExpense.execute(userId, id, request.toDetails()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@CurrentUser String userId, @PathVariable String id) {
        deleteExpense.execute(userId, id);
    }

    private static List<ExpenseResponse> toResponses(List<Expense> expenses) {
        return expenses.stream().map(ExpenseResponse::from).toList();
    }
}

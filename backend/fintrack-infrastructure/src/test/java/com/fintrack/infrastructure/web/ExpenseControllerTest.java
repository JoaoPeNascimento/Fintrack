package com.fintrack.infrastructure.web;

import com.fintrack.application.expense.CreateExpense;
import com.fintrack.application.expense.DeleteExpense;
import com.fintrack.application.expense.GetMonthlySummary;
import com.fintrack.application.expense.ListActiveExpenses;
import com.fintrack.application.expense.ListExpensesByMonth;
import com.fintrack.application.expense.UpdateExpense;
import com.fintrack.application.user.SyncAuthenticatedUser;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.ExpenseDetails;
import com.fintrack.domain.expense.PaymentMethod;
import com.fintrack.domain.shared.NotFoundException;
import com.fintrack.domain.shared.ValidationException;
import com.fintrack.domain.user.User;
import com.fintrack.infrastructure.security.SecurityConfig;
import com.fintrack.infrastructure.web.expense.ExpenseController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ExpenseController.class)
@Import(SecurityConfig.class)
class ExpenseControllerTest {

    private static final String USER_ID = "65f000000000000000000001";

    @Autowired
    MockMvc mvc;

    @MockitoBean
    JwtDecoder jwtDecoder;
    @MockitoBean
    SyncAuthenticatedUser syncAuthenticatedUser;
    @MockitoBean
    CreateExpense createExpense;
    @MockitoBean
    UpdateExpense updateExpense;
    @MockitoBean
    DeleteExpense deleteExpense;
    @MockitoBean
    ListActiveExpenses listActiveExpenses;
    @MockitoBean
    ListExpensesByMonth listExpensesByMonth;
    @MockitoBean
    GetMonthlySummary getMonthlySummary;

    private static RequestPostProcessor user() {
        return jwt().jwt(j -> j.subject("joao@example.com").claim("name", "João"));
    }

    @BeforeEach
    void setUp() {
        when(syncAuthenticatedUser.execute(eq("joao@example.com"), any(), any()))
                .thenReturn(new User(USER_ID, "joao@example.com", "João", null, "google"));
    }

    @Test
    void rejectsRequestsWithoutToken() throws Exception {
        mvc.perform(get("/api/v1/expenses/active")).andExpect(status().isUnauthorized());
    }

    @Test
    void listsActiveExpensesOfAuthenticatedUser() throws Exception {
        Expense tv = Expense.restore("e1", USER_ID, "TV", null, new BigDecimal("100"), LocalDate.of(2026, 1, 5),
                PaymentMethod.CARTAO, 3, "c1", null);
        when(listActiveExpenses.execute(USER_ID)).thenReturn(List.of(tv));

        mvc.perform(get("/api/v1/expenses/active").with(user()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("e1"))
                .andExpect(jsonPath("$[0].date").value("2026-01-05"))
                .andExpect(jsonPath("$[0].paymentMethod").value("CARTAO"))
                .andExpect(jsonPath("$[0].installments").value(3));
    }

    @Test
    void translatesLegacyCardPaymentMethod() throws Exception {
        when(createExpense.execute(eq(USER_ID), any())).thenAnswer(inv ->
                Expense.create(USER_ID, inv.getArgument(1), LocalDate.of(2026, 3, 1)));

        mvc.perform(post("/api/v1/expenses").with(user())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"TV","value":300,"date":"2026-03-10","paymentMethod":"CARD_c1","installments":3}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.value").value(100))
                .andExpect(jsonPath("$.cardId").value("c1"));

        ArgumentCaptor<ExpenseDetails> details = ArgumentCaptor.forClass(ExpenseDetails.class);
        verify(createExpense).execute(eq(USER_ID), details.capture());
        assertThat(details.getValue().paymentMethod()).isEqualTo(PaymentMethod.CARTAO);
        assertThat(details.getValue().cardId()).isEqualTo("c1");
    }

    @Test
    void mapsDomainErrorsToStatusAndMessage() throws Exception {
        when(createExpense.execute(anyString(), any())).thenThrow(new ValidationException("Informe o nome do gasto."));
        doThrow(new NotFoundException("Gasto não encontrado ou não autorizado."))
                .when(deleteExpense).execute(USER_ID, "x");

        mvc.perform(post("/api/v1/expenses").with(user())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"value\":1,\"paymentMethod\":\"PIX\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Informe o nome do gasto."));

        mvc.perform(delete("/api/v1/expenses/x").with(user()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Gasto não encontrado ou não autorizado."));

        mvc.perform(post("/api/v1/expenses").with(user())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"X\",\"value\":1,\"paymentMethod\":\"BOLETO\"}"))
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/v1/expenses").param("month", "abc").param("year", "2026").with(user()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Requisição inválida."));
    }
}

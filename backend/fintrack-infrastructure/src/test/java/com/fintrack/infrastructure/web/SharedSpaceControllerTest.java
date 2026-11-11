package com.fintrack.infrastructure.web;

import com.fintrack.application.card.CreateCard;
import com.fintrack.application.card.DeleteCard;
import com.fintrack.application.card.ListCards;
import com.fintrack.application.card.UpdateCard;
import com.fintrack.application.expense.CreateExpense;
import com.fintrack.application.expense.DeleteExpense;
import com.fintrack.application.expense.ListActiveExpenses;
import com.fintrack.application.expense.UpdateExpense;
import com.fintrack.application.fixedexpense.CreateFixedExpense;
import com.fintrack.application.fixedexpense.DeleteFixedExpense;
import com.fintrack.application.fixedexpense.ListFixedExpenses;
import com.fintrack.application.fixedexpense.UpdateFixedExpense;
import com.fintrack.application.share.ShareAccess;
import com.fintrack.application.user.SyncAuthenticatedUser;
import com.fintrack.domain.expense.Expense;
import com.fintrack.domain.expense.PaymentMethod;
import com.fintrack.domain.share.ShareAction;
import com.fintrack.domain.share.SharePermission;
import com.fintrack.domain.shared.ForbiddenException;
import com.fintrack.domain.shared.NotFoundException;
import com.fintrack.domain.user.User;
import com.fintrack.infrastructure.security.SecurityConfig;
import com.fintrack.infrastructure.web.share.SharedSpaceController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SharedSpaceController.class)
@Import(SecurityConfig.class)
class SharedSpaceControllerTest {

    private static final String GUEST_ID = "65f000000000000000000002";
    private static final String OWNER_ID = "65f000000000000000000001";

    @Autowired
    MockMvc mvc;

    @MockitoBean
    JwtDecoder jwtDecoder;
    @MockitoBean
    SyncAuthenticatedUser syncAuthenticatedUser;
    @MockitoBean
    ShareAccess shareAccess;
    @MockitoBean
    ListActiveExpenses listActiveExpenses;
    @MockitoBean
    CreateExpense createExpense;
    @MockitoBean
    UpdateExpense updateExpense;
    @MockitoBean
    DeleteExpense deleteExpense;
    @MockitoBean
    ListFixedExpenses listFixedExpenses;
    @MockitoBean
    CreateFixedExpense createFixedExpense;
    @MockitoBean
    UpdateFixedExpense updateFixedExpense;
    @MockitoBean
    DeleteFixedExpense deleteFixedExpense;
    @MockitoBean
    ListCards listCards;
    @MockitoBean
    CreateCard createCard;
    @MockitoBean
    UpdateCard updateCard;
    @MockitoBean
    DeleteCard deleteCard;

    private static RequestPostProcessor guest() {
        return jwt().jwt(j -> j.subject("convidado@example.com"));
    }

    @BeforeEach
    void setUp() {
        when(syncAuthenticatedUser.execute(eq("convidado@example.com"), any(), any()))
                .thenReturn(new User(GUEST_ID, "convidado@example.com", "Convidado", null, "google"));
    }

    @Test
    void listsOwnerExpensesForAuthorizedGuest() throws Exception {
        when(shareAccess.authorize(GUEST_ID, OWNER_ID, ShareAction.VIEW)).thenReturn(SharePermission.VIEW_ONLY);
        when(listActiveExpenses.execute(OWNER_ID)).thenReturn(List.of(Expense.restore("e1", OWNER_ID, "Mercado",
                null, new BigDecimal("50"), LocalDate.of(2026, 11, 3), PaymentMethod.PIX, 1, null, null)));

        mvc.perform(get("/api/v1/shared/" + OWNER_ID + "/expenses/active").with(guest()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("e1"));
    }

    @Test
    void createsExpenseOnBehalfOfOwner() throws Exception {
        when(shareAccess.authorize(GUEST_ID, OWNER_ID, ShareAction.CREATE_EXPENSE))
                .thenReturn(SharePermission.ADD_EXPENSES);
        when(createExpense.execute(eq(OWNER_ID), any())).thenAnswer(inv ->
                Expense.create(OWNER_ID, inv.getArgument(1), LocalDate.of(2026, 11, 1)));

        mvc.perform(post("/api/v1/shared/" + OWNER_ID + "/expenses").with(guest())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Pão\",\"value\":10,\"date\":\"2026-11-05\",\"paymentMethod\":\"PIX\"}"))
                .andExpect(status().isCreated());

        verify(createExpense).execute(eq(OWNER_ID), any());
    }

    @Test
    void forbiddenActionReturns403WithoutTouchingData() throws Exception {
        when(shareAccess.authorize(GUEST_ID, OWNER_ID, ShareAction.MODIFY_EXPENSE))
                .thenThrow(new ForbiddenException("Você não tem permissão para esta ação neste compartilhamento."));

        mvc.perform(delete("/api/v1/shared/" + OWNER_ID + "/expenses/e1").with(guest()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Você não tem permissão para esta ação neste compartilhamento."));

        verify(deleteExpense, never()).execute(any(), any());
    }

    @Test
    void nonMemberGets404() throws Exception {
        when(shareAccess.authorize(GUEST_ID, OWNER_ID, ShareAction.VIEW))
                .thenThrow(new NotFoundException("Compartilhamento não encontrado ou desativado."));

        mvc.perform(get("/api/v1/shared/" + OWNER_ID + "/cards").with(guest()))
                .andExpect(status().isNotFound());

        verify(listCards, never()).execute(any());
    }
}

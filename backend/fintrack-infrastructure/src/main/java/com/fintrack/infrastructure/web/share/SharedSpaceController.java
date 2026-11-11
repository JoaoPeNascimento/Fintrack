package com.fintrack.infrastructure.web.share;

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
import com.fintrack.domain.share.ShareAction;
import com.fintrack.infrastructure.web.CurrentUser;
import com.fintrack.infrastructure.web.card.CardController.CardRequest;
import com.fintrack.infrastructure.web.card.CardController.CardResponse;
import com.fintrack.infrastructure.web.expense.ExpenseController.ExpenseRequest;
import com.fintrack.infrastructure.web.expense.ExpenseController.ExpenseResponse;
import com.fintrack.infrastructure.web.fixedexpense.FixedExpenseController.FixedExpenseRequest;
import com.fintrack.infrastructure.web.fixedexpense.FixedExpenseController.FixedExpenseResponse;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Gastos, despesas fixas e cartões de outro usuário, acessados por um convidado. Cada rota autoriza o
 * convidado conforme a regra do compartilhamento e delega aos mesmos casos de uso do dono, com o id dele.
 */
@RestController
@RequestMapping("/api/v1/shared/{ownerId}")
public class SharedSpaceController {

    private final ShareAccess access;
    private final ListActiveExpenses listActiveExpenses;
    private final CreateExpense createExpense;
    private final UpdateExpense updateExpense;
    private final DeleteExpense deleteExpense;
    private final ListFixedExpenses listFixedExpenses;
    private final CreateFixedExpense createFixedExpense;
    private final UpdateFixedExpense updateFixedExpense;
    private final DeleteFixedExpense deleteFixedExpense;
    private final ListCards listCards;
    private final CreateCard createCard;
    private final UpdateCard updateCard;
    private final DeleteCard deleteCard;

    public SharedSpaceController(ShareAccess access, ListActiveExpenses listActiveExpenses,
                                 CreateExpense createExpense, UpdateExpense updateExpense, DeleteExpense deleteExpense,
                                 ListFixedExpenses listFixedExpenses, CreateFixedExpense createFixedExpense,
                                 UpdateFixedExpense updateFixedExpense, DeleteFixedExpense deleteFixedExpense,
                                 ListCards listCards, CreateCard createCard, UpdateCard updateCard,
                                 DeleteCard deleteCard) {
        this.access = access;
        this.listActiveExpenses = listActiveExpenses;
        this.createExpense = createExpense;
        this.updateExpense = updateExpense;
        this.deleteExpense = deleteExpense;
        this.listFixedExpenses = listFixedExpenses;
        this.createFixedExpense = createFixedExpense;
        this.updateFixedExpense = updateFixedExpense;
        this.deleteFixedExpense = deleteFixedExpense;
        this.listCards = listCards;
        this.createCard = createCard;
        this.updateCard = updateCard;
        this.deleteCard = deleteCard;
    }

    // ----- Gastos variáveis -----

    @GetMapping("/expenses/active")
    public List<ExpenseResponse> activeExpenses(@CurrentUser String viewerId, @PathVariable String ownerId) {
        access.authorize(viewerId, ownerId, ShareAction.VIEW);
        return listActiveExpenses.execute(ownerId).stream().map(ExpenseResponse::from).toList();
    }

    @PostMapping("/expenses")
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse createExpense(@CurrentUser String viewerId, @PathVariable String ownerId,
                                         @RequestBody ExpenseRequest request) {
        access.authorize(viewerId, ownerId, ShareAction.CREATE_EXPENSE);
        return ExpenseResponse.from(createExpense.execute(ownerId, request.toDetails()));
    }

    @PutMapping("/expenses/{id}")
    public ExpenseResponse updateExpense(@CurrentUser String viewerId, @PathVariable String ownerId,
                                         @PathVariable String id, @RequestBody ExpenseRequest request) {
        access.authorize(viewerId, ownerId, ShareAction.MODIFY_EXPENSE);
        return ExpenseResponse.from(updateExpense.execute(ownerId, id, request.toDetails()));
    }

    @DeleteMapping("/expenses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteExpense(@CurrentUser String viewerId, @PathVariable String ownerId, @PathVariable String id) {
        access.authorize(viewerId, ownerId, ShareAction.MODIFY_EXPENSE);
        deleteExpense.execute(ownerId, id);
    }

    // ----- Despesas fixas -----

    @GetMapping("/fixed-expenses")
    public List<FixedExpenseResponse> fixedExpenses(@CurrentUser String viewerId, @PathVariable String ownerId) {
        access.authorize(viewerId, ownerId, ShareAction.VIEW);
        return listFixedExpenses.execute(ownerId).stream().map(FixedExpenseResponse::from).toList();
    }

    @PostMapping("/fixed-expenses")
    @ResponseStatus(HttpStatus.CREATED)
    public FixedExpenseResponse createFixedExpense(@CurrentUser String viewerId, @PathVariable String ownerId,
                                                   @RequestBody FixedExpenseRequest request) {
        access.authorize(viewerId, ownerId, ShareAction.MANAGE_CARDS_AND_FIXED);
        return FixedExpenseResponse.from(createFixedExpense.execute(ownerId, request.toDetails()));
    }

    @PutMapping("/fixed-expenses/{id}")
    public FixedExpenseResponse updateFixedExpense(@CurrentUser String viewerId, @PathVariable String ownerId,
                                                   @PathVariable String id, @RequestBody FixedExpenseRequest request) {
        access.authorize(viewerId, ownerId, ShareAction.MANAGE_CARDS_AND_FIXED);
        return FixedExpenseResponse.from(updateFixedExpense.execute(ownerId, id, request.toDetails()));
    }

    @DeleteMapping("/fixed-expenses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFixedExpense(@CurrentUser String viewerId, @PathVariable String ownerId,
                                   @PathVariable String id) {
        access.authorize(viewerId, ownerId, ShareAction.MANAGE_CARDS_AND_FIXED);
        deleteFixedExpense.execute(ownerId, id);
    }

    // ----- Cartões -----

    @GetMapping("/cards")
    public List<CardResponse> cards(@CurrentUser String viewerId, @PathVariable String ownerId) {
        access.authorize(viewerId, ownerId, ShareAction.VIEW);
        return listCards.execute(ownerId).stream().map(CardResponse::from).toList();
    }

    @PostMapping("/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse createCard(@CurrentUser String viewerId, @PathVariable String ownerId,
                                   @RequestBody CardRequest request) {
        access.authorize(viewerId, ownerId, ShareAction.MANAGE_CARDS_AND_FIXED);
        return CardResponse.from(createCard.execute(ownerId, request.toDetails()));
    }

    @PutMapping("/cards/{id}")
    public CardResponse updateCard(@CurrentUser String viewerId, @PathVariable String ownerId,
                                   @PathVariable String id, @RequestBody CardRequest request) {
        access.authorize(viewerId, ownerId, ShareAction.MANAGE_CARDS_AND_FIXED);
        return CardResponse.from(updateCard.execute(ownerId, id, request.toDetails()));
    }

    @DeleteMapping("/cards/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCard(@CurrentUser String viewerId, @PathVariable String ownerId, @PathVariable String id) {
        access.authorize(viewerId, ownerId, ShareAction.MANAGE_CARDS_AND_FIXED);
        deleteCard.execute(ownerId, id);
    }
}

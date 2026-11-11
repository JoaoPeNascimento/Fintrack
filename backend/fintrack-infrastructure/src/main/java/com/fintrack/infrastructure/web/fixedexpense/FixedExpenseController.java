package com.fintrack.infrastructure.web.fixedexpense;

import com.fintrack.application.fixedexpense.CreateFixedExpense;
import com.fintrack.application.fixedexpense.DeleteFixedExpense;
import com.fintrack.application.fixedexpense.ListFixedExpenses;
import com.fintrack.application.fixedexpense.UpdateFixedExpense;
import com.fintrack.domain.fixedexpense.FixedExpense;
import com.fintrack.domain.fixedexpense.FixedExpenseDetails;
import com.fintrack.infrastructure.web.CurrentUser;
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

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/fixed-expenses")
public class FixedExpenseController {

    public record FixedExpenseRequest(String name, String description, BigDecimal value) {

        public FixedExpenseDetails toDetails() {
            return new FixedExpenseDetails(name, description, value);
        }
    }

    public record FixedExpenseResponse(String id, String name, String description, BigDecimal value) {

        public static FixedExpenseResponse from(FixedExpense expense) {
            return new FixedExpenseResponse(expense.id(), expense.name(), expense.description(), expense.value());
        }
    }

    private final CreateFixedExpense createFixedExpense;
    private final ListFixedExpenses listFixedExpenses;
    private final UpdateFixedExpense updateFixedExpense;
    private final DeleteFixedExpense deleteFixedExpense;

    public FixedExpenseController(CreateFixedExpense createFixedExpense, ListFixedExpenses listFixedExpenses,
                                  UpdateFixedExpense updateFixedExpense, DeleteFixedExpense deleteFixedExpense) {
        this.createFixedExpense = createFixedExpense;
        this.listFixedExpenses = listFixedExpenses;
        this.updateFixedExpense = updateFixedExpense;
        this.deleteFixedExpense = deleteFixedExpense;
    }

    @GetMapping
    public List<FixedExpenseResponse> list(@CurrentUser String userId) {
        return listFixedExpenses.execute(userId).stream().map(FixedExpenseResponse::from).toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FixedExpenseResponse create(@CurrentUser String userId, @RequestBody FixedExpenseRequest request) {
        return FixedExpenseResponse.from(createFixedExpense.execute(userId, request.toDetails()));
    }

    @PutMapping("/{id}")
    public FixedExpenseResponse update(@CurrentUser String userId, @PathVariable String id,
                                       @RequestBody FixedExpenseRequest request) {
        return FixedExpenseResponse.from(updateFixedExpense.execute(userId, id, request.toDetails()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@CurrentUser String userId, @PathVariable String id) {
        deleteFixedExpense.execute(userId, id);
    }
}

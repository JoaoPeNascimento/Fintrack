package com.fintrack.infrastructure.config;

import com.fintrack.application.card.CreateCard;
import com.fintrack.application.card.DeleteCard;
import com.fintrack.application.card.ListCards;
import com.fintrack.application.card.UpdateCard;
import com.fintrack.application.expense.CreateExpense;
import com.fintrack.application.expense.DeleteExpense;
import com.fintrack.application.expense.GetMonthlySummary;
import com.fintrack.application.expense.ListActiveExpenses;
import com.fintrack.application.expense.ListExpensesByMonth;
import com.fintrack.application.expense.UpdateExpense;
import com.fintrack.application.fixedexpense.CreateFixedExpense;
import com.fintrack.application.fixedexpense.DeleteFixedExpense;
import com.fintrack.application.fixedexpense.ListFixedExpenses;
import com.fintrack.application.fixedexpense.UpdateFixedExpense;
import com.fintrack.application.user.SyncAuthenticatedUser;
import com.fintrack.domain.card.CardRepository;
import com.fintrack.domain.expense.ExpenseRepository;
import com.fintrack.domain.fixedexpense.FixedExpenseRepository;
import com.fintrack.domain.user.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

/** Registra os casos de uso como beans, mantendo o núcleo livre de anotações do Spring. */
@Configuration
public class UseCaseConfig {

    @Bean
    Clock clock(FintrackProperties properties) {
        return Clock.system(ZoneId.of(properties.timezone()));
    }

    @Bean
    SyncAuthenticatedUser syncAuthenticatedUser(UserRepository users) {
        return new SyncAuthenticatedUser(users);
    }

    @Bean
    CreateCard createCard(CardRepository cards) {
        return new CreateCard(cards);
    }

    @Bean
    ListCards listCards(CardRepository cards) {
        return new ListCards(cards);
    }

    @Bean
    UpdateCard updateCard(CardRepository cards) {
        return new UpdateCard(cards);
    }

    @Bean
    DeleteCard deleteCard(CardRepository cards) {
        return new DeleteCard(cards);
    }

    @Bean
    CreateFixedExpense createFixedExpense(FixedExpenseRepository fixedExpenses) {
        return new CreateFixedExpense(fixedExpenses);
    }

    @Bean
    ListFixedExpenses listFixedExpenses(FixedExpenseRepository fixedExpenses) {
        return new ListFixedExpenses(fixedExpenses);
    }

    @Bean
    UpdateFixedExpense updateFixedExpense(FixedExpenseRepository fixedExpenses) {
        return new UpdateFixedExpense(fixedExpenses);
    }

    @Bean
    DeleteFixedExpense deleteFixedExpense(FixedExpenseRepository fixedExpenses) {
        return new DeleteFixedExpense(fixedExpenses);
    }

    @Bean
    CreateExpense createExpense(ExpenseRepository expenses, CardRepository cards, Clock clock) {
        return new CreateExpense(expenses, cards, clock);
    }

    @Bean
    UpdateExpense updateExpense(ExpenseRepository expenses, CardRepository cards, Clock clock) {
        return new UpdateExpense(expenses, cards, clock);
    }

    @Bean
    DeleteExpense deleteExpense(ExpenseRepository expenses) {
        return new DeleteExpense(expenses);
    }

    @Bean
    ListActiveExpenses listActiveExpenses(ExpenseRepository expenses, Clock clock) {
        return new ListActiveExpenses(expenses, clock);
    }

    @Bean
    ListExpensesByMonth listExpensesByMonth(ExpenseRepository expenses) {
        return new ListExpensesByMonth(expenses);
    }

    @Bean
    GetMonthlySummary getMonthlySummary(ExpenseRepository expenses) {
        return new GetMonthlySummary(expenses);
    }
}

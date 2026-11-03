package com.fintrack.domain.fixedexpense;

import java.math.BigDecimal;

public record FixedExpenseDetails(String name, String description, BigDecimal value) {
}

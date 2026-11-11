package com.fintrack.domain.share;

import com.fintrack.domain.shared.ValidationException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExpenseShareTest {

    private static final Instant T1 = Instant.parse("2026-11-01T10:00:00Z");
    private static final Instant T2 = Instant.parse("2026-11-02T10:00:00Z");

    @Test
    void joinIsIdempotentAndKeepsFirstJoinDate() {
        ExpenseShare share = ExpenseShare.create("owner", SharePermission.VIEW_ONLY, "tok");

        share.join("guest", T1);
        ShareMember again = share.join("guest", T2);

        assertThat(share.members()).hasSize(1);
        assertThat(again.joinedAt()).isEqualTo(T1);
        assertThat(share.grantsAccessTo("guest")).isTrue();
    }

    @Test
    void ownerCannotJoinOwnShare() {
        ExpenseShare share = ExpenseShare.create("owner", SharePermission.EDIT_ALL, "tok");

        assertThatThrownBy(() -> share.join("owner", T1))
                .isInstanceOf(ValidationException.class)
                .hasMessage("Você não pode aceitar o próprio compartilhamento.");
    }

    @Test
    void disabledShareDeniesAccessAndNewMembers() {
        ExpenseShare share = ExpenseShare.create("owner", SharePermission.EDIT_ALL, "tok");
        share.join("guest", T1);

        share.configure(SharePermission.EDIT_ALL, false);

        assertThat(share.isMember("guest")).isTrue();
        assertThat(share.grantsAccessTo("guest")).isFalse();
        assertThatThrownBy(() -> share.join("other", T1)).isInstanceOf(ValidationException.class);
    }

    @Test
    void removeMemberAndRegenerateToken() {
        ExpenseShare share = ExpenseShare.create("owner", SharePermission.VIEW_ONLY, "tok");
        share.join("guest", T1);

        assertThat(share.removeMember("guest")).isTrue();
        assertThat(share.removeMember("guest")).isFalse();

        share.regenerateToken("tok2");
        assertThat(share.token()).isEqualTo("tok2");
    }

    @ParameterizedTest
    @CsvSource({
            "VIEW_ONLY,    VIEW,                   true",
            "VIEW_ONLY,    CREATE_EXPENSE,         false",
            "VIEW_ONLY,    MODIFY_EXPENSE,         false",
            "VIEW_ONLY,    MANAGE_CARDS_AND_FIXED, false",
            "ADD_EXPENSES, VIEW,                   true",
            "ADD_EXPENSES, CREATE_EXPENSE,         true",
            "ADD_EXPENSES, MODIFY_EXPENSE,         false",
            "ADD_EXPENSES, MANAGE_CARDS_AND_FIXED, false",
            "EDIT_ALL,     VIEW,                   true",
            "EDIT_ALL,     CREATE_EXPENSE,         true",
            "EDIT_ALL,     MODIFY_EXPENSE,         true",
            "EDIT_ALL,     MANAGE_CARDS_AND_FIXED, true",
    })
    void permissionMatrix(SharePermission permission, ShareAction action, boolean allowed) {
        assertThat(permission.allows(action)).isEqualTo(allowed);
    }

    @Test
    void parsesPermission() {
        assertThat(SharePermission.from(" add_expenses ")).isEqualTo(SharePermission.ADD_EXPENSES);
        assertThatThrownBy(() -> SharePermission.from("ADMIN")).isInstanceOf(ValidationException.class);
        assertThatThrownBy(() -> SharePermission.from(null)).isInstanceOf(ValidationException.class);
    }
}

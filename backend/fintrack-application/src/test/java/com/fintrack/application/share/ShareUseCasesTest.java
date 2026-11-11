package com.fintrack.application.share;

import com.fintrack.application.InMemoryRepositories;
import com.fintrack.application.share.ShareViews.Invite;
import com.fintrack.application.share.ShareViews.MyShare;
import com.fintrack.domain.share.ShareAction;
import com.fintrack.domain.share.SharePermission;
import com.fintrack.domain.shared.ForbiddenException;
import com.fintrack.domain.shared.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ShareUseCasesTest {

    private final InMemoryRepositories.Shares shares = new InMemoryRepositories.Shares();
    private final InMemoryRepositories.Users users = new InMemoryRepositories.Users();
    private final AtomicInteger tokenSeq = new AtomicInteger();
    private final Clock clock = Clock.fixed(Instant.parse("2026-11-10T12:00:00Z"), ZoneOffset.UTC);

    private final ShareAccess access = new ShareAccess(shares);
    private final ManageShare manage = new ManageShare(shares, users, () -> "token-" + tokenSeq.incrementAndGet());
    private final ShareInvites invites = new ShareInvites(shares, users, clock);
    private final SharedWithMe sharedWithMe = new SharedWithMe(shares, users, access);

    @BeforeEach
    void setUp() {
        users.add("owner", "dono@example.com", "Dono");
        users.add("guest", "convidado@example.com", "Convidado");
    }

    @Test
    void ownerConfiguresAndGuestAcceptsThroughLink() {
        MyShare config = manage.configure("owner", SharePermission.VIEW_ONLY, true);

        Invite invite = invites.preview("guest", config.token());
        assertThat(invite.owner().name()).isEqualTo("Dono");
        assertThat(invite.alreadyMember()).isFalse();
        assertThat(invite.isOwner()).isFalse();

        assertThat(invites.accept("guest", config.token())).isEqualTo("owner");
        assertThat(invites.preview("guest", config.token()).alreadyMember()).isTrue();
        assertThat(sharedWithMe.list("guest")).extracting(s -> s.owner().id()).containsExactly("owner");

        MyShare afterJoin = manage.get("owner").orElseThrow();
        assertThat(afterJoin.members()).extracting(m -> m.user().email()).containsExactly("convidado@example.com");
        assertThat(afterJoin.members().get(0).joinedAt()).isEqualTo(clock.instant());
    }

    @Test
    void reconfiguringKeepsTokenAndMembers() {
        String token = manage.configure("owner", SharePermission.VIEW_ONLY, true).token();
        invites.accept("guest", token);

        MyShare updated = manage.configure("owner", SharePermission.EDIT_ALL, true);

        assertThat(updated.token()).isEqualTo(token);
        assertThat(updated.members()).hasSize(1);
        assertThat(access.authorize("guest", "owner", ShareAction.MANAGE_CARDS_AND_FIXED))
                .isEqualTo(SharePermission.EDIT_ALL);
    }

    @Test
    void permissionIsEnforced() {
        String token = manage.configure("owner", SharePermission.ADD_EXPENSES, true).token();
        invites.accept("guest", token);

        assertThat(access.authorize("guest", "owner", ShareAction.CREATE_EXPENSE))
                .isEqualTo(SharePermission.ADD_EXPENSES);
        assertThatThrownBy(() -> access.authorize("guest", "owner", ShareAction.MODIFY_EXPENSE))
                .isInstanceOf(ForbiddenException.class);
        assertThatThrownBy(() -> access.authorize("stranger", "owner", ShareAction.VIEW))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void disablingBlocksAccessAndTheLink() {
        String token = manage.configure("owner", SharePermission.EDIT_ALL, true).token();
        invites.accept("guest", token);

        manage.configure("owner", SharePermission.EDIT_ALL, false);

        assertThatThrownBy(() -> access.authorize("guest", "owner", ShareAction.VIEW))
                .isInstanceOf(NotFoundException.class);
        assertThatThrownBy(() -> invites.preview("guest", token)).isInstanceOf(NotFoundException.class);
        assertThat(sharedWithMe.list("guest")).isEmpty();

        manage.configure("owner", SharePermission.EDIT_ALL, true);
        assertThat(sharedWithMe.list("guest")).hasSize(1);
    }

    @Test
    void regeneratingInvalidatesOldLinkButKeepsMembers() {
        String oldToken = manage.configure("owner", SharePermission.VIEW_ONLY, true).token();
        invites.accept("guest", oldToken);

        String newToken = manage.regenerateLink("owner").token();

        assertThat(newToken).isNotEqualTo(oldToken);
        assertThatThrownBy(() -> invites.accept("guest", oldToken)).isInstanceOf(NotFoundException.class);
        assertThat(access.authorize("guest", "owner", ShareAction.VIEW)).isEqualTo(SharePermission.VIEW_ONLY);
    }

    @Test
    void removedOrLeavingMemberLosesAccess() {
        String token = manage.configure("owner", SharePermission.VIEW_ONLY, true).token();
        invites.accept("guest", token);

        manage.removeMember("owner", "guest");
        assertThatThrownBy(() -> access.authorize("guest", "owner", ShareAction.VIEW))
                .isInstanceOf(NotFoundException.class);
        assertThatThrownBy(() -> manage.removeMember("owner", "guest")).isInstanceOf(NotFoundException.class);

        invites.accept("guest", token);
        sharedWithMe.leave("guest", "owner");
        assertThat(sharedWithMe.list("guest")).isEmpty();
    }

    @Test
    void ownerOpeningOwnLinkIsFlagged() {
        String token = manage.configure("owner", SharePermission.VIEW_ONLY, true).token();

        assertThat(invites.preview("owner", token).isOwner()).isTrue();
        assertThatThrownBy(() -> invites.accept("owner", token))
                .hasMessage("Você não pode aceitar o próprio compartilhamento.");
    }

    @Test
    void unknownTokenIsNotFound() {
        assertThatThrownBy(() -> invites.preview("guest", "nope")).isInstanceOf(NotFoundException.class);
        assertThat(manage.get("owner")).isEmpty();
    }
}

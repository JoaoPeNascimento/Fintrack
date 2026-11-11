package com.fintrack.application.share;

import com.fintrack.application.share.ShareViews.Invite;
import com.fintrack.domain.share.ExpenseShare;
import com.fintrack.domain.share.ExpenseShareRepository;
import com.fintrack.domain.shared.NotFoundException;
import com.fintrack.domain.user.UserRepository;

import java.time.Clock;
import java.util.List;

/** Fluxo do convidado a partir do link: ver a prévia e aceitar. */
public class ShareInvites {

    private final ExpenseShareRepository shares;
    private final UserRepository users;
    private final Clock clock;

    public ShareInvites(ExpenseShareRepository shares, UserRepository users, Clock clock) {
        this.shares = shares;
        this.users = users;
        this.clock = clock;
    }

    public Invite preview(String viewerId, String token) {
        ExpenseShare share = findEnabled(token);
        UserDirectory directory = UserDirectory.load(users, List.of(share.ownerId()));
        return new Invite(directory.summary(share.ownerId()), share.permission(),
                share.isMember(viewerId), share.ownerId().equals(viewerId));
    }

    /** @return o id do dono, para abrir a visão geral compartilhada */
    public String accept(String viewerId, String token) {
        ExpenseShare share = findEnabled(token);
        shares.addMember(share.ownerId(), share.join(viewerId, clock.instant()));
        return share.ownerId();
    }

    private ExpenseShare findEnabled(String token) {
        return shares.findByToken(token)
                .filter(ExpenseShare::enabled)
                .orElseThrow(() -> new NotFoundException("Link de compartilhamento inválido ou desativado."));
    }
}

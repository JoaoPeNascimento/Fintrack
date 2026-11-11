package com.fintrack.application.share;

import com.fintrack.application.share.ShareViews.SharedSpace;
import com.fintrack.domain.share.ExpenseShare;
import com.fintrack.domain.share.ExpenseShareRepository;
import com.fintrack.domain.share.ShareAction;
import com.fintrack.domain.share.SharePermission;
import com.fintrack.domain.shared.NotFoundException;
import com.fintrack.domain.user.UserRepository;

import java.util.List;

/** Compartilhamentos que outros usuários fizeram com o usuário atual. */
public class SharedWithMe {

    private final ExpenseShareRepository shares;
    private final UserRepository users;
    private final ShareAccess access;

    public SharedWithMe(ExpenseShareRepository shares, UserRepository users, ShareAccess access) {
        this.shares = shares;
        this.users = users;
        this.access = access;
    }

    /** Apenas os habilitados: um compartilhamento desativado some da lista até ser reativado. */
    public List<SharedSpace> list(String viewerId) {
        List<ExpenseShare> active = shares.findAllByMember(viewerId).stream()
                .filter(s -> s.grantsAccessTo(viewerId))
                .toList();
        UserDirectory directory = UserDirectory.load(users, active.stream().map(ExpenseShare::ownerId).toList());
        return active.stream()
                .map(s -> new SharedSpace(directory.summary(s.ownerId()), s.permission()))
                .toList();
    }

    public SharedSpace get(String viewerId, String ownerId) {
        SharePermission permission = access.authorize(viewerId, ownerId, ShareAction.VIEW);
        return new SharedSpace(UserDirectory.load(users, List.of(ownerId)).summary(ownerId), permission);
    }

    public void leave(String viewerId, String ownerId) {
        if (!shares.removeMember(ownerId, viewerId)) {
            throw new NotFoundException(ShareAccess.NOT_FOUND);
        }
    }
}

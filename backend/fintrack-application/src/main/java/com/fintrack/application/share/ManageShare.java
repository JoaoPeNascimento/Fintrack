package com.fintrack.application.share;

import com.fintrack.application.share.ShareViews.MemberView;
import com.fintrack.application.share.ShareViews.MyShare;
import com.fintrack.domain.share.ExpenseShare;
import com.fintrack.domain.share.ExpenseShareRepository;
import com.fintrack.domain.share.ShareMember;
import com.fintrack.domain.share.SharePermission;
import com.fintrack.domain.share.ShareTokenGenerator;
import com.fintrack.domain.shared.NotFoundException;
import com.fintrack.domain.user.UserRepository;

import java.util.Optional;

/** Operações do dono sobre o próprio compartilhamento: configurar, trocar o link e remover convidados. */
public class ManageShare {

    private final ExpenseShareRepository shares;
    private final UserRepository users;
    private final ShareTokenGenerator tokens;

    public ManageShare(ExpenseShareRepository shares, UserRepository users, ShareTokenGenerator tokens) {
        this.shares = shares;
        this.users = users;
        this.tokens = tokens;
    }

    public Optional<MyShare> get(String ownerId) {
        return shares.findByOwner(ownerId).map(this::toView);
    }

    /** Cria o compartilhamento (com um novo link) na primeira vez; depois, só altera regra e status. */
    public MyShare configure(String ownerId, SharePermission permission, boolean enabled) {
        ExpenseShare share = shares.findByOwner(ownerId)
                .orElseGet(() -> ExpenseShare.create(ownerId, permission, tokens.newToken()));
        share.configure(permission, enabled);
        return toView(shares.save(share));
    }

    /** Gera um novo link; o anterior deixa de funcionar, mas quem já entrou mantém o acesso. */
    public MyShare regenerateLink(String ownerId) {
        ExpenseShare share = shares.findByOwner(ownerId)
                .orElseThrow(() -> new NotFoundException("Compartilhamento ainda não configurado."));
        share.regenerateToken(tokens.newToken());
        return toView(shares.save(share));
    }

    public void removeMember(String ownerId, String memberId) {
        if (!shares.removeMember(ownerId, memberId)) {
            throw new NotFoundException("Convidado não encontrado.");
        }
    }

    private MyShare toView(ExpenseShare share) {
        UserDirectory directory = UserDirectory.load(users,
                share.members().stream().map(ShareMember::userId).toList());
        return new MyShare(share.token(), share.permission(), share.enabled(),
                share.members().stream()
                        .map(m -> new MemberView(directory.summary(m.userId()), m.joinedAt()))
                        .toList());
    }
}

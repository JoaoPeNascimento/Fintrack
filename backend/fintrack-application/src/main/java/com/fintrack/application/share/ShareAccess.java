package com.fintrack.application.share;

import com.fintrack.domain.share.ExpenseShare;
import com.fintrack.domain.share.ExpenseShareRepository;
import com.fintrack.domain.share.ShareAction;
import com.fintrack.domain.share.SharePermission;
import com.fintrack.domain.shared.ForbiddenException;
import com.fintrack.domain.shared.NotFoundException;

/**
 * Autoriza um convidado a agir sobre os dados de outro usuário. Usado antes de delegar aos casos de uso
 * de gastos, cartões e despesas fixas com o id do dono.
 */
public class ShareAccess {

    static final String NOT_FOUND = "Compartilhamento não encontrado ou desativado.";

    private final ExpenseShareRepository shares;

    public ShareAccess(ExpenseShareRepository shares) {
        this.shares = shares;
    }

    /**
     * @return a regra vigente
     * @throws NotFoundException  se o convidado não for membro ou o compartilhamento estiver desativado
     * @throws ForbiddenException se a regra não permitir a ação
     */
    public SharePermission authorize(String viewerId, String ownerId, ShareAction action) {
        ExpenseShare share = shares.findByOwner(ownerId)
                .filter(s -> s.grantsAccessTo(viewerId))
                .orElseThrow(() -> new NotFoundException(NOT_FOUND));
        if (!share.permission().allows(action)) {
            throw new ForbiddenException("Você não tem permissão para esta ação neste compartilhamento.");
        }
        return share.permission();
    }
}

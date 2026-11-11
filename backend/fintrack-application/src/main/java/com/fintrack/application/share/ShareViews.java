package com.fintrack.application.share;

import com.fintrack.domain.share.SharePermission;
import com.fintrack.domain.user.User;

import java.time.Instant;
import java.util.List;

/** Modelos de leitura devolvidos pelos casos de uso de compartilhamento. */
public final class ShareViews {

    private ShareViews() {
    }

    /** Dados públicos de um usuário, exibidos para o dono ou para os convidados. */
    public record UserSummary(String id, String name, String email, String image) {

        static UserSummary from(User user) {
            return new UserSummary(user.id(), user.name(), user.email(), user.image());
        }

        static UserSummary unknown(String id) {
            return new UserSummary(id, null, null, null);
        }
    }

    public record MemberView(UserSummary user, Instant joinedAt) {
    }

    /** Configuração do compartilhamento, vista pelo dono. */
    public record MyShare(String token, SharePermission permission, boolean enabled, List<MemberView> members) {
    }

    /** Prévia do convite, exibida no modal antes de o convidado aceitar. */
    public record Invite(UserSummary owner, SharePermission permission, boolean alreadyMember, boolean isOwner) {
    }

    /** Um espaço de gastos de outro usuário ao qual o convidado tem acesso. */
    public record SharedSpace(UserSummary owner, SharePermission permission) {
    }
}

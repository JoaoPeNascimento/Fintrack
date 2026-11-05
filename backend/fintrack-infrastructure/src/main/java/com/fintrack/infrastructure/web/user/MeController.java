package com.fintrack.infrastructure.web.user;

import com.fintrack.application.user.SyncAuthenticatedUser;
import com.fintrack.domain.user.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Chamado no login: cadastra o usuário no primeiro acesso e devolve seus dados. */
@RestController
@RequestMapping("/api/v1/me")
public class MeController {

    public record MeResponse(String id, String email, String name, String image) {
    }

    private final SyncAuthenticatedUser syncAuthenticatedUser;

    public MeController(SyncAuthenticatedUser syncAuthenticatedUser) {
        this.syncAuthenticatedUser = syncAuthenticatedUser;
    }

    @GetMapping
    public MeResponse me(@AuthenticationPrincipal Jwt jwt) {
        User user = syncAuthenticatedUser.execute(jwt.getSubject(), jwt.getClaimAsString("name"),
                jwt.getClaimAsString("picture"));
        return new MeResponse(user.id(), user.email(), user.name(), user.image());
    }
}

package com.fintrack.infrastructure.web.share;

import com.fintrack.application.share.ShareInvites;
import com.fintrack.application.share.ShareViews.Invite;
import com.fintrack.infrastructure.web.CurrentUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Link de convite: prévia exibida no modal de confirmação e aceite. */
@RestController
@RequestMapping("/api/v1/share-invites/{token}")
public class ShareInviteController {

    public record AcceptResponse(String ownerId) {
    }

    private final ShareInvites shareInvites;

    public ShareInviteController(ShareInvites shareInvites) {
        this.shareInvites = shareInvites;
    }

    @GetMapping
    public Invite preview(@CurrentUser String userId, @PathVariable String token) {
        return shareInvites.preview(userId, token);
    }

    @PostMapping("/accept")
    public AcceptResponse accept(@CurrentUser String userId, @PathVariable String token) {
        return new AcceptResponse(shareInvites.accept(userId, token));
    }
}

package com.fintrack.infrastructure.web.share;

import com.fintrack.application.share.ManageShare;
import com.fintrack.application.share.ShareViews.MyShare;
import com.fintrack.domain.share.SharePermission;
import com.fintrack.infrastructure.web.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** Compartilhamento do usuário autenticado (visão do dono). */
@RestController
@RequestMapping("/api/v1/share")
public class ShareController {

    public record ShareSettingsRequest(String permission, Boolean enabled) {
    }

    private final ManageShare manageShare;

    public ShareController(ManageShare manageShare) {
        this.manageShare = manageShare;
    }

    /** 204 enquanto o usuário nunca tiver configurado o compartilhamento. */
    @GetMapping
    public ResponseEntity<MyShare> get(@CurrentUser String userId) {
        return manageShare.get(userId).map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping
    public MyShare configure(@CurrentUser String userId, @RequestBody ShareSettingsRequest request) {
        return manageShare.configure(userId, SharePermission.from(request.permission()),
                !Boolean.FALSE.equals(request.enabled()));
    }

    @PostMapping("/regenerate")
    public MyShare regenerate(@CurrentUser String userId) {
        return manageShare.regenerateLink(userId);
    }

    @DeleteMapping("/members/{memberId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@CurrentUser String userId, @PathVariable String memberId) {
        manageShare.removeMember(userId, memberId);
    }
}

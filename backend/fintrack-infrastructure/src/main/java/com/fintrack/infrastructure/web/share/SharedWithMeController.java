package com.fintrack.infrastructure.web.share;

import com.fintrack.application.share.ShareViews.SharedSpace;
import com.fintrack.application.share.SharedWithMe;
import com.fintrack.infrastructure.web.CurrentUser;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Compartilhamentos que outros usuários fizeram com o usuário autenticado. */
@RestController
@RequestMapping("/api/v1/shared")
public class SharedWithMeController {

    private final SharedWithMe sharedWithMe;

    public SharedWithMeController(SharedWithMe sharedWithMe) {
        this.sharedWithMe = sharedWithMe;
    }

    @GetMapping
    public List<SharedSpace> list(@CurrentUser String userId) {
        return sharedWithMe.list(userId);
    }

    @GetMapping("/{ownerId}")
    public SharedSpace get(@CurrentUser String userId, @PathVariable String ownerId) {
        return sharedWithMe.get(userId, ownerId);
    }

    @DeleteMapping("/{ownerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leave(@CurrentUser String userId, @PathVariable String ownerId) {
        sharedWithMe.leave(userId, ownerId);
    }
}

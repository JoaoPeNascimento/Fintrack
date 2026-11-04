package com.fintrack.infrastructure.web;

import com.fintrack.application.user.SyncAuthenticatedUser;
import com.fintrack.domain.user.User;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.MethodParameter;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.time.Duration;

@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    static final int MAX_CACHED_USERS = 10_000;
    static final Duration CACHE_TTL = Duration.ofMinutes(10);

    private final SyncAuthenticatedUser syncAuthenticatedUser;

    /**
     * e-mail -> id do usuário; evita uma consulta ao banco por requisição. Limitado e com expiração,
     * para que um usuário removido/recriado volte a ser resolvido no banco em no máximo {@link #CACHE_TTL}.
     */
    private final Cache<String, String> userIds;

    @Autowired
    public CurrentUserArgumentResolver(SyncAuthenticatedUser syncAuthenticatedUser) {
        this(syncAuthenticatedUser, Caffeine.newBuilder()
                .maximumSize(MAX_CACHED_USERS)
                .expireAfterWrite(CACHE_TTL)
                .build());
    }

    CurrentUserArgumentResolver(SyncAuthenticatedUser syncAuthenticatedUser, Cache<String, String> userIds) {
        this.syncAuthenticatedUser = syncAuthenticatedUser;
        this.userIds = userIds;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        return parameter.hasParameterAnnotation(CurrentUser.class) && parameter.getParameterType() == String.class;
    }

    @Override
    public String resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new AuthenticationCredentialsNotFoundException("Usuário não autenticado.");
        }
        return resolveUserId(jwt);
    }

    /**
     * A consulta ao banco roda fora de qualquer lock do cache: requisições concorrentes do mesmo
     * e-mail podem sincronizar em paralelo, o que é seguro porque o cadastro é um upsert atômico.
     */
    String resolveUserId(Jwt jwt) {
        String email = jwt.getSubject();
        String cached = userIds.getIfPresent(email);
        if (cached != null) {
            return cached;
        }
        String id = sync(jwt).id();
        userIds.put(email, id);
        return id;
    }

    User sync(Jwt jwt) {
        return syncAuthenticatedUser.execute(jwt.getSubject(), jwt.getClaimAsString("name"),
                jwt.getClaimAsString("picture"));
    }
}

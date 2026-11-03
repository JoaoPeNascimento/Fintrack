package com.fintrack.infrastructure.web;

import com.fintrack.application.user.SyncAuthenticatedUser;
import com.fintrack.domain.user.User;
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

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CurrentUserArgumentResolver implements HandlerMethodArgumentResolver {

    private final SyncAuthenticatedUser syncAuthenticatedUser;
    /** e-mail -> id do usuário; evita uma consulta ao banco por requisição. */
    private final Map<String, String> userIds = new ConcurrentHashMap<>();

    public CurrentUserArgumentResolver(SyncAuthenticatedUser syncAuthenticatedUser) {
        this.syncAuthenticatedUser = syncAuthenticatedUser;
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
        return userIds.computeIfAbsent(jwt.getSubject(), email -> sync(jwt).id());
    }

    User sync(Jwt jwt) {
        return syncAuthenticatedUser.execute(jwt.getSubject(), jwt.getClaimAsString("name"),
                jwt.getClaimAsString("picture"));
    }
}

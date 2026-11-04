package com.fintrack.infrastructure.web;

import com.fintrack.application.user.SyncAuthenticatedUser;
import com.fintrack.domain.user.User;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jwt.Jwt;

import java.time.Duration;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CurrentUserArgumentResolverTest {

    private final AtomicLong nanos = new AtomicLong();
    private final Cache<String, String> cache = Caffeine.newBuilder()
            .ticker(nanos::get)
            .executor(Runnable::run)
            .maximumSize(CurrentUserArgumentResolver.MAX_CACHED_USERS)
            .expireAfterWrite(CurrentUserArgumentResolver.CACHE_TTL)
            .build();
    private final SyncAuthenticatedUser sync = mock(SyncAuthenticatedUser.class);
    private final CurrentUserArgumentResolver resolver = new CurrentUserArgumentResolver(sync, cache);

    private static Jwt token(String email) {
        return Jwt.withTokenValue("t").header("alg", "HS256").subject(email).build();
    }

    @Test
    void cachesUserIdAndRefreshesAfterTtl() {
        when(sync.execute(eq("a@x.com"), any(), any()))
                .thenReturn(new User("id-1", "a@x.com", null, null, null))
                .thenReturn(new User("id-2", "a@x.com", null, null, null));

        assertThat(resolver.resolveUserId(token("a@x.com"))).isEqualTo("id-1");
        assertThat(resolver.resolveUserId(token("a@x.com"))).isEqualTo("id-1");
        verify(sync, times(1)).execute(eq("a@x.com"), any(), any());

        // Usuário recriado no banco: após o TTL o novo id passa a valer.
        nanos.addAndGet(CurrentUserArgumentResolver.CACHE_TTL.plus(Duration.ofSeconds(1)).toNanos());

        assertThat(resolver.resolveUserId(token("a@x.com"))).isEqualTo("id-2");
        verify(sync, times(2)).execute(eq("a@x.com"), any(), any());
    }
}

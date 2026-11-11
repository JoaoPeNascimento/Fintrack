package com.fintrack.application.share;

import com.fintrack.application.share.ShareViews.UserSummary;
import com.fintrack.domain.user.User;
import com.fintrack.domain.user.UserRepository;

import java.util.Collection;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Resolve vários usuários em uma única consulta. */
final class UserDirectory {

    private final Map<String, User> byId;

    private UserDirectory(Map<String, User> byId) {
        this.byId = byId;
    }

    static UserDirectory load(UserRepository users, Collection<String> ids) {
        if (ids.isEmpty()) {
            return new UserDirectory(Map.of());
        }
        return new UserDirectory(users.findAllByIds(ids).stream()
                .collect(Collectors.toMap(User::id, Function.identity(), (a, b) -> a)));
    }

    UserSummary summary(String id) {
        User user = byId.get(id);
        return user != null ? UserSummary.from(user) : UserSummary.unknown(id);
    }
}

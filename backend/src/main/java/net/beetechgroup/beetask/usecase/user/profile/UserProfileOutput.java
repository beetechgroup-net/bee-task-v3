package net.beetechgroup.beetask.usecase.user.profile;

import java.util.List;

public record UserProfileOutput(
    String name,
    String email,
    String photo,
    List<OrganizationProfileOutput> organizations
) {
    public record OrganizationProfileOutput(
        Long id,
        String name,
        List<String> roles
    ) {}
}

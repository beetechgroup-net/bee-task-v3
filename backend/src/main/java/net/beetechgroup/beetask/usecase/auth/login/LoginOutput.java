package net.beetechgroup.beetask.usecase.auth.login;

import java.util.List;

public record LoginOutput(
    String name,
    String email,
    String photo,
    String jwt,
    String refreshToken,
    Long expiresIn,
    String issuedAt,
    List<OrganizationOutput> organizations
) {
    public record OrganizationOutput(
        String name,
        List<String> roles
    ) {}
}

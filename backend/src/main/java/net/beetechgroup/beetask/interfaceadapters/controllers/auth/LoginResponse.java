package net.beetechgroup.beetask.interfaceadapters.controllers.auth;

import java.util.List;

public record LoginResponse(
    String name,
    String email,
    String photo,
    String jwt,
    String refreshToken,
    Long expiresIn,
    String issuedAt,
    List<Organization> organizations
) {
    public record Organization(
        Long id,
        String name,
        List<String> roles
    ) {}
}

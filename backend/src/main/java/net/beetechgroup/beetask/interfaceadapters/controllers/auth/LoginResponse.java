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
    List<OrganizationDTO> organizations
) {
    public record OrganizationDTO(
        String name,
        List<String> roles
    ) {}
}

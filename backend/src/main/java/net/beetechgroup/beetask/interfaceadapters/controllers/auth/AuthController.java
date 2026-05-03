package net.beetechgroup.beetask.interfaceadapters.controllers.auth;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.time.LocalDateTime;
import java.util.List;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Authentication operations (Mocked)")
public class AuthController {

    @Path("/login")
    @POST
    @Operation(summary = "Login", description = "Mocked login that returns user data")
    public LoginResponse login() {
        return new LoginResponse(
            "Gabriel Menezes",
            "gabriel@beetech.net",
            "https://ui-avatars.com/api/?name=Gabriel+Menezes&background=random",
            "mocked-jwt-token-abcd-1234",
            "mocked-refresh-token-wxyz-5678",
            3600L, // 1 hour
            LocalDateTime.now().toString(),
            List.of(
                new LoginResponse.OrganizationDTO("BeeTech Group", List.of("ADMIN", "OWNER")),
                new LoginResponse.OrganizationDTO("SkyMob Dev", List.of("DEVELOPER"))
            )
        );
    }

    @Path("/refresh")
    @POST
    @Operation(summary = "Refresh token", description = "Mocked token refresh")
    public LoginResponse refresh() {
        return new LoginResponse(
            "Gabriel Menezes",
            "gabriel@beetech.net",
            "https://ui-avatars.com/api/?name=Gabriel+Menezes&background=random",
            "refreshed-jwt-token-" + System.currentTimeMillis(),
            "refreshed-refresh-token-" + System.currentTimeMillis(),
            3600L,
            LocalDateTime.now().toString(),
            List.of(
                new LoginResponse.OrganizationDTO("BeeTech Group", List.of("ADMIN", "OWNER")),
                new LoginResponse.OrganizationDTO("SkyMob Dev", List.of("DEVELOPER"))
            )
        );
    }
}

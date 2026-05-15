package net.beetechgroup.beetask.interfaceadapters.controllers.auth;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import jakarta.inject.Inject;
import net.beetechgroup.beetask.usecase.auth.login.LoginInput;
import net.beetechgroup.beetask.usecase.auth.login.LoginOutput;
import net.beetechgroup.beetask.usecase.auth.login.LoginUseCase;
import net.beetechgroup.beetask.usecase.auth.refresh.RefreshTokenInput;
import net.beetechgroup.beetask.usecase.auth.refresh.RefreshTokenUseCase;
import net.beetechgroup.beetask.usecase.user.create.CreateUserInput;
import net.beetechgroup.beetask.usecase.user.create.CreateUserOutput;
import net.beetechgroup.beetask.usecase.user.create.CreateUserUseCase;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.ws.rs.GET;
import net.beetechgroup.beetask.usecase.user.profile.GetUserProfileUseCase;
import net.beetechgroup.beetask.usecase.user.profile.UserProfileOutput;
import org.jboss.logging.Logger;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Authentication operations")
public class AuthController {
    private static final Logger LOGGER = Logger.getLogger(AuthController.class);

    @Inject
    CreateUserUseCase createUserUseCase;

    @Inject
    LoginUseCase loginUseCase;

    @Inject
    RefreshTokenUseCase refreshTokenUseCase;

    @Inject
    GetUserProfileUseCase getUserProfileUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @Path("/me")
    @GET
    @Authenticated
    @Operation(summary = "Get current user profile", description = "Returns details of the logged in user")
    public UserProfileOutput me() {
        String email = securityIdentity.getPrincipal().getName();
        LOGGER.infof("Profile requested for authenticated user %s", email);
        return getUserProfileUseCase.execute(email);
    }

    @Path("/register")
    @POST
    @Operation(summary = "Register", description = "Creates a new user account")
    public CreateAccountResponse register(CreateAccountRequest request) {
        LOGGER.infof("Registration requested for email %s", request.email());
        CreateUserInput input = AuthControllerMapper.toCreateUserInput(request);
        CreateUserOutput output = createUserUseCase.execute(input);
        LOGGER.infof("User account created successfully for email %s", output.email());
        return AuthControllerMapper.toCreateAccountResponse(output);
    }

    @Path("/login")
    @POST
    @Operation(summary = "Login", description = "Login that returns real user data and JWT")
    public LoginResponse login(LoginRequest request) {
        LOGGER.infof("Login requested for email %s", request.email());
        LoginInput input = AuthControllerMapper.toLoginInput(request);
        LoginOutput output = loginUseCase.execute(input);
        LOGGER.infof("Login succeeded for email %s", output.email());
        return AuthControllerMapper.toLoginResponse(output);
    }

    @Path("/refresh")
    @POST
    @Operation(summary = "Refresh token", description = "Token refresh using refresh token")
    public LoginResponse refresh(RefreshTokenRequest request) {
        LOGGER.info("Refresh token requested");
        RefreshTokenInput input = AuthControllerMapper.toRefreshTokenInput(request);
        LoginOutput output = refreshTokenUseCase.execute(input);
        LOGGER.infof("Refresh token succeeded for email %s", output.email());
        return AuthControllerMapper.toLoginResponse(output);
    }
}

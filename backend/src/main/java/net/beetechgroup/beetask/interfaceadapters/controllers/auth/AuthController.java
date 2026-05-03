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

import java.time.LocalDateTime;
import java.util.List;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Authentication", description = "Authentication operations")
public class AuthController {

    @Inject
    CreateUserUseCase createUserUseCase;

    @Inject
    LoginUseCase loginUseCase;

    @Inject
    RefreshTokenUseCase refreshTokenUseCase;

    @Path("/register")
    @POST
    @Operation(summary = "Register", description = "Creates a new user account")
    public CreateAccountResponse register(CreateAccountRequest request) {
        CreateUserInput input = AuthControllerMapper.toCreateUserInput(request);
        CreateUserOutput output = createUserUseCase.execute(input);
        return AuthControllerMapper.toCreateAccountResponse(output);
    }

    @Path("/login")
    @POST
    @Operation(summary = "Login", description = "Login that returns real user data and JWT")
    public LoginResponse login(LoginRequest request) {
        LoginInput input = AuthControllerMapper.toLoginInput(request);
        LoginOutput output = loginUseCase.execute(input);
        return AuthControllerMapper.toLoginResponse(output);
    }

    @Path("/refresh")
    @POST
    @Operation(summary = "Refresh token", description = "Token refresh using refresh token")
    public LoginResponse refresh(RefreshTokenRequest request) {
        RefreshTokenInput input = AuthControllerMapper.toRefreshTokenInput(request);
        LoginOutput output = refreshTokenUseCase.execute(input);
        return AuthControllerMapper.toLoginResponse(output);
    }
}

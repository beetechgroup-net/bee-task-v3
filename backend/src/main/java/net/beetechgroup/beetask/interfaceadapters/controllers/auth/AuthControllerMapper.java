package net.beetechgroup.beetask.interfaceadapters.controllers.auth;

import net.beetechgroup.beetask.usecase.auth.login.LoginInput;
import net.beetechgroup.beetask.usecase.auth.login.LoginOutput;
import net.beetechgroup.beetask.usecase.auth.refresh.RefreshTokenInput;
import net.beetechgroup.beetask.usecase.user.create.CreateUserInput;
import net.beetechgroup.beetask.usecase.user.create.CreateUserOutput;
import java.util.stream.Collectors;

public class AuthControllerMapper {

    public static CreateUserInput toCreateUserInput(CreateAccountRequest request) {
        return new CreateUserInput(request.name(), request.email(), request.password());
    }

    public static CreateAccountResponse toCreateAccountResponse(CreateUserOutput output) {
        return new CreateAccountResponse(output.id(), output.name(), output.email());
    }

    public static LoginInput toLoginInput(LoginRequest request) {
        return new LoginInput(request.email(), request.password());
    }

    public static RefreshTokenInput toRefreshTokenInput(RefreshTokenRequest request) {
        return new RefreshTokenInput(request.refreshToken());
    }

    public static LoginResponse toLoginResponse(LoginOutput output) {
        return new LoginResponse(
            output.name(),
            output.email(),
            output.photo(),
            output.jwt(),
            output.refreshToken(),
            output.expiresIn(),
            output.issuedAt(),
            output.organizations().stream()
                .map(org -> new LoginResponse.Organization(org.name(), org.roles()))
                .collect(Collectors.toList())
        );
    }
}

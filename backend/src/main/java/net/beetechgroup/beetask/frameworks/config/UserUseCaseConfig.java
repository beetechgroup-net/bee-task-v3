package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import net.beetechgroup.beetask.usecase.auth.login.LoginUseCase;
import net.beetechgroup.beetask.usecase.auth.refresh.RefreshTokenUseCase;
import net.beetechgroup.beetask.usecase.user.create.CreateUserUseCase;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import io.smallrye.jwt.auth.principal.JWTParser;

@ApplicationScoped
public class UserUseCaseConfig {

    @Inject
    JWTParser jwtParser;

    @Produces
    public CreateUserUseCase createUserUseCase(UserRepository userRepository) {
        return new CreateUserUseCase(userRepository);
    }

    @Produces
    public LoginUseCase loginUseCase(UserRepository userRepository) {
        return new LoginUseCase(userRepository);
    }

    @Produces
    public RefreshTokenUseCase refreshTokenUseCase(UserRepository userRepository) {
        return new RefreshTokenUseCase(userRepository, jwtParser);
    }
}

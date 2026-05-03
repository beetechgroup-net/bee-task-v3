package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import net.beetechgroup.beetask.usecase.auth.login.LoginUseCase;
import net.beetechgroup.beetask.usecase.auth.refresh.RefreshTokenUseCase;
import net.beetechgroup.beetask.usecase.user.create.CreateUserUseCase;
import net.beetechgroup.beetask.usecase.user.profile.GetUserProfileUseCase;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import io.smallrye.jwt.auth.principal.JWTParser;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class UserUseCaseConfig {

    @Inject
    JWTParser jwtParser;

    @Inject
    @ConfigProperty(name = "mp.jwt.verify.issuer")
    String issuer;

    @Produces
    public CreateUserUseCase createUserUseCase(UserRepository userRepository) {
        return new CreateUserUseCase(userRepository);
    }

    @Produces
    public LoginUseCase loginUseCase(UserRepository userRepository) {
        return new LoginUseCase(userRepository, issuer);
    }

    @Produces
    public RefreshTokenUseCase refreshTokenUseCase(UserRepository userRepository) {
        return new RefreshTokenUseCase(userRepository, jwtParser, issuer);
    }

    @Produces
    public GetUserProfileUseCase getUserProfileUseCase(UserRepository userRepository) {
        return new GetUserProfileUseCase(userRepository);
    }
}

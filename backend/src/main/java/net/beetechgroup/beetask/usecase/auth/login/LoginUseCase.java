package net.beetechgroup.beetask.usecase.auth.login;

import io.smallrye.jwt.build.Jwt;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.usecase.auth.TokenConstants;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

public class LoginUseCase {
    private static final Logger LOGGER = Logger.getLogger(LoginUseCase.class);

    private final UserRepository userRepository;
    private final String issuer;

    public LoginUseCase(UserRepository userRepository, String issuer) {
        this.userRepository = userRepository;
        this.issuer = issuer;
    }

    public LoginOutput execute(LoginInput input) {
        Optional<User> userOptional = userRepository.findByEmail(input.email());

        if (userOptional.isEmpty()) {
            LOGGER.warnf("Login failed because email %s was not found", input.email());
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOptional.get();

        // Simple password check for now (should use Bcrypt)
        if (!user.getPassword().equals(input.password())) {
            LOGGER.warnf("Login failed because password did not match for email %s", input.email());
            throw new RuntimeException("Invalid credentials");
        }

        LOGGER.infof("Login authenticated for user %s", input.email());
        List<UserOrganization> userOrganizations = userRepository.findUserOrganizations(user.getId());

        Set<String> groups = new HashSet<>();
        userOrganizations.forEach(uo -> groups.add(uo.getRole().name()));

        String token = Jwt.issuer(this.issuer)
                .upn(user.getEmail())
                .groups(groups)
                .claim("name", user.getName())
                .expiresIn(TokenConstants.ACCESS_TOKEN_EXPIRY_SECONDS)
                .sign();

        List<LoginOutput.OrganizationOutput> orgs = userOrganizations.stream()
                .collect(Collectors.groupingBy(uo -> uo.getOrganization().getId()))
                .entrySet().stream()
                .map(entry -> {
                    UserOrganization first = entry.getValue().get(0);
                    return new LoginOutput.OrganizationOutput(
                            entry.getKey(),
                            first.getOrganization().getName(),
                            entry.getValue().stream().map(uo -> uo.getRole().name()).toList()
                    );
                })
                .toList();

        String refreshToken = Jwt.issuer(this.issuer)
                .upn(user.getEmail())
                .expiresIn(TokenConstants.REFRESH_TOKEN_EXPIRY_SECONDS)
                .sign();

        LOGGER.infof("Login completed for user %s with %d organizations", user.getEmail(), orgs.size());
        return new LoginOutput(
                user.getName(),
                user.getEmail(),
                Objects.nonNull(user.getPhoto()) ? user.getPhoto() : "https://ui-avatars.com/api/?name=" + user.getName().replace(" ", "+") + "&background=random",
                token,
                refreshToken,
                TokenConstants.ACCESS_TOKEN_EXPIRY_SECONDS,
                Instant.now().toString(),
                orgs
        );
    }
}

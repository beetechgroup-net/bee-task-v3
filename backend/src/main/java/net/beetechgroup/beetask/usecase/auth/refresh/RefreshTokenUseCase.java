package net.beetechgroup.beetask.usecase.auth.refresh;

import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;
import io.smallrye.jwt.build.Jwt;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.usecase.auth.TokenConstants;
import net.beetechgroup.beetask.usecase.auth.login.LoginOutput;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

public class RefreshTokenUseCase {
    private static final Logger LOGGER = Logger.getLogger(RefreshTokenUseCase.class);

    private final UserRepository userRepository;
    private final JWTParser jwtParser;
    private final String issuer;

    public RefreshTokenUseCase(UserRepository userRepository, JWTParser jwtParser, String issuer) {
        this.userRepository = userRepository;
        this.jwtParser = jwtParser;
        this.issuer = issuer;
    }

    public LoginOutput execute(RefreshTokenInput input) {
        try {
            JsonWebToken token = jwtParser.parse(input.refreshToken());
            String email = token.getSubject(); // Or token.getName() / token.getClaim(Claims.upn.name())

            if (Objects.isNull(email)) {
                LOGGER.warn("Refresh token rejected because subject/email was not present");
                throw new RuntimeException("Invalid refresh token: email not found");
            }

            LOGGER.infof("Refreshing authentication token for user %s", email);
            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                LOGGER.warnf("Refresh token rejected because user %s was not found", email);
                throw new RuntimeException("User not found for the provided refresh token");
            }

            User user = userOptional.get();
            List<UserOrganization> userOrganizations = userRepository.findUserOrganizations(user.getId());

            Set<String> groups = new HashSet<>();
            userOrganizations.forEach(uo -> groups.add(uo.getRole().name()));

            String newToken = Jwt.issuer(this.issuer)
                    .upn(user.getEmail())
                    .groups(groups)
                    .claim("name", user.getName())
                    .expiresIn(TokenConstants.ACCESS_TOKEN_EXPIRY_SECONDS)
                    .sign();

            String newRefreshToken = Jwt.issuer(this.issuer)
                    .upn(user.getEmail())
                    .expiresIn(TokenConstants.REFRESH_TOKEN_EXPIRY_SECONDS)
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

            LOGGER.infof("Refresh token completed for user %s with %d organizations", user.getEmail(), orgs.size());
            return new LoginOutput(
                    user.getName(),
                    user.getEmail(),
                    Objects.nonNull(user.getPhoto()) ? user.getPhoto() : "https://ui-avatars.com/api/?name=" + user.getName().replace(" ", "+") + "&background=random",
                    newToken,
                    newRefreshToken,
                    TokenConstants.ACCESS_TOKEN_EXPIRY_SECONDS,
                    Instant.now().toString(),
                    orgs
            );
        } catch (ParseException e) {
            LOGGER.error("Refresh token parsing failed", e);
            throw new RuntimeException("Invalid refresh token: " + e.getMessage());
        }
    }
}

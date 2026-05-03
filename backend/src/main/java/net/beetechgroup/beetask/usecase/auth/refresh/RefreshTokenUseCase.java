package net.beetechgroup.beetask.usecase.auth.refresh;

import io.smallrye.jwt.auth.principal.JWTParser;
import io.smallrye.jwt.auth.principal.ParseException;
import io.smallrye.jwt.build.Jwt;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.usecase.auth.login.LoginOutput;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public class RefreshTokenUseCase {

    private final UserRepository userRepository;
    private final JWTParser jwtParser;

    public RefreshTokenUseCase(UserRepository userRepository, JWTParser jwtParser) {
        this.userRepository = userRepository;
        this.jwtParser = jwtParser;
    }

    public LoginOutput execute(RefreshTokenInput input) {
        try {
            JsonWebToken token = jwtParser.parse(input.refreshToken());
            String email = token.getSubject(); // Or token.getName() / token.getClaim(Claims.upn.name())

            if (email == null) {
                throw new RuntimeException("Invalid refresh token: email not found");
            }

            Optional<User> userOptional = userRepository.findByEmail(email);
            if (userOptional.isEmpty()) {
                throw new RuntimeException("User not found for the provided refresh token");
            }

            User user = userOptional.get();
            List<UserOrganization> userOrganizations = userRepository.findUserOrganizations(user.getId());

            Set<String> groups = new HashSet<>();
            userOrganizations.forEach(uo -> groups.add(uo.getRole().name()));

            String newToken = Jwt.issuer("https://beetech.net")
                    .upn(user.getEmail())
                    .groups(groups)
                    .claim("name", user.getName())
                    .expiresIn(3600)
                    .sign();

            // Generate a new refresh token (also a JWT but with longer expiration)
            String newRefreshToken = Jwt.issuer("https://beetech.net")
                    .upn(user.getEmail())
                    .expiresIn(86400) // 24 hours
                    .sign();

            List<LoginOutput.OrganizationOutput> orgs = userOrganizations.stream()
                    .collect(Collectors.groupingBy(uo -> uo.getOrganization().getName()))
                    .entrySet().stream()
                    .map(entry -> new LoginOutput.OrganizationOutput(
                            entry.getKey(),
                            entry.getValue().stream().map(uo -> uo.getRole().name()).collect(Collectors.toList())
                    ))
                    .collect(Collectors.toList());

            return new LoginOutput(
                    user.getName(),
                    user.getEmail(),
                    user.getPhoto() != null ? user.getPhoto() : "https://ui-avatars.com/api/?name=" + user.getName().replace(" ", "+") + "&background=random",
                    newToken,
                    newRefreshToken,
                    3600L,
                    LocalDateTime.now().toString(),
                    orgs
            );
        } catch (ParseException e) {
            throw new RuntimeException("Invalid refresh token: " + e.getMessage());
        }
    }
}

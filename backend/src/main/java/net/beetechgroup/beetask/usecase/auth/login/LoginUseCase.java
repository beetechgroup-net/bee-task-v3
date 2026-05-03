package net.beetechgroup.beetask.usecase.auth.login;

import io.smallrye.jwt.build.Jwt;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

public class LoginUseCase {

    private final UserRepository userRepository;

    public LoginUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public LoginOutput execute(LoginInput input) {
        Optional<User> userOptional = userRepository.findByEmail(input.email());

        if (userOptional.isEmpty()) {
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOptional.get();

        // Simple password check for now (should use Bcrypt)
        if (!user.getPassword().equals(input.password())) {
            throw new RuntimeException("Invalid credentials");
        }

        List<UserOrganization> userOrganizations = userRepository.findUserOrganizations(user.getId());

        Set<String> groups = new HashSet<>();
        userOrganizations.forEach(uo -> groups.add(uo.getRole().name()));

        String token = Jwt.issuer("https://beetech.net")
                .upn(user.getEmail())
                .groups(groups)
                .claim("name", user.getName())
                .expiresIn(3600)
                .sign();

        List<LoginOutput.OrganizationOutput> orgs = userOrganizations.stream()
                .collect(Collectors.groupingBy(uo -> uo.getOrganization().getName()))
                .entrySet().stream()
                .map(entry -> new LoginOutput.OrganizationOutput(
                        entry.getKey(),
                        entry.getValue().stream().map(uo -> uo.getRole().name()).collect(Collectors.toList())
                ))
                .collect(Collectors.toList());

        String refreshToken = Jwt.issuer("https://beetech.net")
                .upn(user.getEmail())
                .expiresIn(86400) // 24 hours
                .sign();

        return new LoginOutput(
                user.getName(),
                user.getEmail(),
                user.getPhoto() != null ? user.getPhoto() : "https://ui-avatars.com/api/?name=" + user.getName().replace(" ", "+") + "&background=random",
                token,
                refreshToken,
                3600L,
                LocalDateTime.now().toString(),
                orgs
        );
    }
}

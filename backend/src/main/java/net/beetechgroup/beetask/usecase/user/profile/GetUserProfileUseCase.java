package net.beetechgroup.beetask.usecase.user.profile;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

public class GetUserProfileUseCase {

    private final UserRepository userRepository;

    public GetUserProfileUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserProfileOutput execute(String email) {
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        List<UserOrganization> userOrganizations = userRepository.findUserOrganizations(user.getId());

        List<UserProfileOutput.OrganizationProfileOutput> orgs = userOrganizations.stream()
                .collect(Collectors.groupingBy(uo -> uo.getOrganization().getId()))
                .entrySet().stream()
                .map(entry -> {
                    UserOrganization firstUo = entry.getValue().get(0);
                    return new UserProfileOutput.OrganizationProfileOutput(
                        entry.getKey(),
                        firstUo.getOrganization().getName(),
                        entry.getValue().stream().map(uo -> uo.getRole().name()).collect(Collectors.toList())
                    );
                })
                .collect(Collectors.toList());

        return new UserProfileOutput(
                user.getName(),
                user.getEmail(),
                user.getPhoto() != null ? user.getPhoto() : "https://ui-avatars.com/api/?name=" + user.getName().replace(" ", "+") + "&background=random",
                orgs
        );
    }
}

package net.beetechgroup.beetask.usecase.organization.requests;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

import java.util.List;

public class ListUserJoinRequestsUseCase {
    private final UserOrganizationRepository userOrganizationRepository;
    private final UserRepository userRepository;

    public ListUserJoinRequestsUseCase(UserOrganizationRepository userOrganizationRepository, UserRepository userRepository) {
        this.userOrganizationRepository = userOrganizationRepository;
        this.userRepository = userRepository;
    }

    public List<UserJoinRequestOutput> execute(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return userOrganizationRepository.findByUserId(user.getId()).stream()
                .map(uo -> new UserJoinRequestOutput(
                        uo.getOrganization().getId(),
                        uo.getOrganization().getName(),
                        uo.getStatus()
                ))
                .toList();
    }
}

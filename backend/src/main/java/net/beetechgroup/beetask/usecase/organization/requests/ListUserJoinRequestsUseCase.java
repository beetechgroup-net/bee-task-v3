package net.beetechgroup.beetask.usecase.organization.requests;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

import java.util.List;
import org.jboss.logging.Logger;

public class ListUserJoinRequestsUseCase {
    private static final Logger LOGGER = Logger.getLogger(ListUserJoinRequestsUseCase.class);
    private final UserOrganizationRepository userOrganizationRepository;
    private final UserRepository userRepository;

    public ListUserJoinRequestsUseCase(UserOrganizationRepository userOrganizationRepository, UserRepository userRepository) {
        this.userOrganizationRepository = userOrganizationRepository;
        this.userRepository = userRepository;
    }

    public List<UserJoinRequestOutput> execute(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> {
                    LOGGER.warnf("Join request listing failed because user %s was not found", userEmail);
                    return new RuntimeException("User not found");
                });

        List<UserJoinRequestOutput> requests = userOrganizationRepository.findByUserId(user.getId()).stream()
                .map(uo -> new UserJoinRequestOutput(
                        uo.getOrganization().getId(),
                        uo.getOrganization().getName(),
                        uo.getStatus()
                ))
                .toList();
        LOGGER.infof("Loaded %d join requests for user %s", requests.size(), userEmail);
        return requests;
    }
}

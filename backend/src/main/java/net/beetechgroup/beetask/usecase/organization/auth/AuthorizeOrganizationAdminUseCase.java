package net.beetechgroup.beetask.usecase.organization.auth;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationRole;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

import java.util.Optional;
import org.jboss.logging.Logger;

public class AuthorizeOrganizationAdminUseCase {
    private static final Logger LOGGER = Logger.getLogger(AuthorizeOrganizationAdminUseCase.class);
    private final UserRepository userRepository;
    private final UserOrganizationRepository userOrganizationRepository;

    public AuthorizeOrganizationAdminUseCase(UserRepository userRepository, 
                                           UserOrganizationRepository userOrganizationRepository) {
        this.userRepository = userRepository;
        this.userOrganizationRepository = userOrganizationRepository;
    }

    public void execute(String userEmail, Long organizationId) {
        Optional<User> userOptional = userRepository.findByEmail(userEmail);
        if (userOptional.isEmpty()) {
            LOGGER.warnf("Organization admin authorization failed because user %s was not found", userEmail);
            throw new RuntimeException("Unauthorized: User not found");
        }

        User user = userOptional.get();
        Optional<UserOrganization> association = userOrganizationRepository.findByUserAndOrganization(user.getId(), organizationId);

        if (association.isEmpty()) {
            LOGGER.warnf("Organization admin authorization failed because user %s is not a member of organization %d",
                    userEmail, organizationId);
            throw new RuntimeException("Forbidden: Not a member of this organization");
        }

        UserOrganization uo = association.get();
        if (uo.getRole() != UserOrganizationRole.OWNER && uo.getRole() != UserOrganizationRole.ADMIN) {
            LOGGER.warnf("Organization admin authorization failed because user %s has role %s in organization %d",
                    userEmail, uo.getRole(), organizationId);
            throw new RuntimeException("Forbidden: Only owners or admins can perform this action");
        }
        LOGGER.infof("Organization admin authorization granted to user %s for organization %d", userEmail, organizationId);
    }
}

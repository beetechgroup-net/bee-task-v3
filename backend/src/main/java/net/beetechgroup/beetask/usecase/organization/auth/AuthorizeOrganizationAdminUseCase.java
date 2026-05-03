package net.beetechgroup.beetask.usecase.organization.auth;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationRole;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

import java.util.Optional;

public class AuthorizeOrganizationAdminUseCase {
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
            throw new RuntimeException("Unauthorized: User not found");
        }

        User user = userOptional.get();
        Optional<UserOrganization> association = userOrganizationRepository.findByUserAndOrganization(user.getId(), organizationId);

        if (association.isEmpty()) {
            throw new RuntimeException("Forbidden: Not a member of this organization");
        }

        UserOrganization uo = association.get();
        if (uo.getRole() != UserOrganizationRole.OWNER && uo.getRole() != UserOrganizationRole.ADMIN) {
            throw new RuntimeException("Forbidden: Only owners or admins can perform this action");
        }
    }
}

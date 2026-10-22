package net.beetechgroup.beetask.usecase.organization.auth;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

import java.util.Optional;

public class AuthorizeOrganizationMemberUseCase {
    private static final Logger LOGGER = Logger.getLogger(AuthorizeOrganizationMemberUseCase.class);
    private final UserRepository userRepository;
    private final UserOrganizationRepository userOrganizationRepository;

    public AuthorizeOrganizationMemberUseCase(UserRepository userRepository,
                                              UserOrganizationRepository userOrganizationRepository) {
        this.userRepository = userRepository;
        this.userOrganizationRepository = userOrganizationRepository;
    }

    public User execute(String userEmail, Long organizationId) {
        if (userEmail == null || userEmail.isBlank()) {
            throw new SecurityException("Usuário não autenticado.");
        }
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new SecurityException("Usuário não encontrado: " + userEmail));

        if (organizationId == null) {
            return user;
        }

        Optional<UserOrganization> association = userOrganizationRepository.findByUserAndOrganization(user.getId(), organizationId);
        if (association.isEmpty() || association.get().getStatus() != UserOrganizationStatus.ACTIVE) {
            LOGGER.warnf("User %s is not an active member of organization %d", userEmail, organizationId);
            throw new SecurityException("Você não tem permissão para acessar recursos desta organização.");
        }
        return user;
    }
}

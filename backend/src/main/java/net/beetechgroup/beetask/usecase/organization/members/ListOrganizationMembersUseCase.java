package net.beetechgroup.beetask.usecase.organization.members;

import java.util.List;

import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

public class ListOrganizationMembersUseCase {
    private static final Logger LOGGER = Logger.getLogger(ListOrganizationMembersUseCase.class);

    private final UserRepository userRepository;
    private final UserOrganizationRepository userOrganizationRepository;

    public ListOrganizationMembersUseCase(UserRepository userRepository,
                                          UserOrganizationRepository userOrganizationRepository) {
        this.userRepository = userRepository;
        this.userOrganizationRepository = userOrganizationRepository;
    }

    public List<OrganizationMemberOutput> execute(String userEmail, Long organizationId) {
        var requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + userEmail));

        boolean belongsToOrganization = userRepository.findUserOrganizations(requester.getId()).stream()
                .anyMatch(membership -> membership.getOrganization().getId().equals(organizationId));

        if (!belongsToOrganization) {
            LOGGER.warnf("User %s attempted to list members of organization %d without membership", userEmail, organizationId);
            throw new SecurityException("Você não tem permissão para listar membros desta organização.");
        }

        List<OrganizationMemberOutput> members = userOrganizationRepository
                .findByOrganizationIdAndStatus(organizationId, UserOrganizationStatus.ACTIVE)
                .stream()
                .map(membership -> new OrganizationMemberOutput(
                        membership.getUser().getId(),
                        membership.getUser().getName(),
                        membership.getUser().getEmail(),
                        membership.getUser().getPhoto()))
                .toList();

        LOGGER.infof("Loaded %d active members for organization %d requested by %s", members.size(), organizationId, userEmail);
        return members;
    }
}

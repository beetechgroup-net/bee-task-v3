package net.beetechgroup.beetask.usecase.organization.members;

import jakarta.persistence.EntityManager;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationRole;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;
import java.util.Optional;

public class RemoveOrganizationMemberUseCase {
    private static final Logger LOGGER = Logger.getLogger(RemoveOrganizationMemberUseCase.class);

    private final UserOrganizationRepository userOrganizationRepository;
    private final UserRepository userRepository;
    private final AuthorizeOrganizationAdminUseCase adminAuthorizer;
    private final EntityManager entityManager;

    public RemoveOrganizationMemberUseCase(UserOrganizationRepository userOrganizationRepository,
                                           UserRepository userRepository,
                                           AuthorizeOrganizationAdminUseCase adminAuthorizer,
                                           EntityManager entityManager) {
        this.userOrganizationRepository = userOrganizationRepository;
        this.userRepository = userRepository;
        this.adminAuthorizer = adminAuthorizer;
        this.entityManager = entityManager;
    }

    @jakarta.transaction.Transactional
    public void execute(String requesterEmail, Long organizationId, Long targetUserId) {
        LOGGER.infof("Admin %s requested removal of member %d from organization %d", requesterEmail, targetUserId, organizationId);
        adminAuthorizer.execute(requesterEmail, organizationId);

        Optional<UserOrganization> targetMembership = userOrganizationRepository.findByUserAndOrganization(targetUserId, organizationId);
        if (targetMembership.isEmpty()) {
            throw new IllegalArgumentException("Membro não encontrado nesta organização.");
        }

        if (targetMembership.get().getRole() == UserOrganizationRole.OWNER) {
            throw new IllegalArgumentException("O proprietário da organização não pode ser removido.");
        }

        // Soft delete the membership
        userOrganizationRepository.deleteByUserAndOrganization(targetUserId, organizationId);

        // Unassign member from tasks in this organization
        entityManager.createQuery(
                "UPDATE TaskEntity t SET t.user = NULL " +
                "WHERE t.user.id = :userId AND (t.organization.id = :orgId OR t.project.organization.id = :orgId OR t.category.organization.id = :orgId)")
                .setParameter("userId", targetUserId)
                .setParameter("orgId", organizationId)
                .executeUpdate();

        // Close any running timer for this member in this organization
        entityManager.createQuery(
                "UPDATE TaskHistoryItemEntity h SET h.endAt = :now " +
                "WHERE h.endAt IS NULL AND (h.user.id = :userId OR (h.user IS NULL AND h.task.user.id = :userId)) AND " +
                "h.task.id IN (SELECT t.id FROM TaskEntity t WHERE t.organization.id = :orgId OR t.project.organization.id = :orgId OR t.category.organization.id = :orgId)")
                .setParameter("now", LocalDateTime.now())
                .setParameter("userId", targetUserId)
                .setParameter("orgId", organizationId)
                .executeUpdate();

        LOGGER.infof("Member %d removed successfully from organization %d", targetUserId, organizationId);
    }
}

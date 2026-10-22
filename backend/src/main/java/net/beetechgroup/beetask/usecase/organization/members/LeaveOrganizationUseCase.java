package net.beetechgroup.beetask.usecase.organization.members;

import jakarta.persistence.EntityManager;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationRole;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;
import java.util.Optional;

public class LeaveOrganizationUseCase {
    private static final Logger LOGGER = Logger.getLogger(LeaveOrganizationUseCase.class);

    private final UserOrganizationRepository userOrganizationRepository;
    private final UserRepository userRepository;
    private final AuthorizeOrganizationMemberUseCase memberAuthorizer;
    private final EntityManager entityManager;

    public LeaveOrganizationUseCase(UserOrganizationRepository userOrganizationRepository,
                                    UserRepository userRepository,
                                    AuthorizeOrganizationMemberUseCase memberAuthorizer,
                                    EntityManager entityManager) {
        this.userOrganizationRepository = userOrganizationRepository;
        this.userRepository = userRepository;
        this.memberAuthorizer = memberAuthorizer;
        this.entityManager = entityManager;
    }

    @jakarta.transaction.Transactional
    public void execute(String userEmail, Long organizationId) {
        LOGGER.infof("User %s requested to leave organization %d", userEmail, organizationId);
        memberAuthorizer.execute(userEmail, organizationId);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + userEmail));

        Optional<UserOrganization> membership = userOrganizationRepository.findByUserAndOrganization(user.getId(), organizationId);
        if (membership.isEmpty()) {
            throw new IllegalArgumentException("Membro não encontrado nesta organização.");
        }

        if (membership.get().getRole() == UserOrganizationRole.OWNER) {
            throw new IllegalArgumentException("O proprietário não pode sair da organização. Transfira a posse antes de sair.");
        }

        userOrganizationRepository.deleteByUserAndOrganization(user.getId(), organizationId);

        // Unassign user from tasks in this organization
        entityManager.createQuery(
                "UPDATE TaskEntity t SET t.user = NULL " +
                "WHERE t.user.id = :userId AND (t.organization.id = :orgId OR t.project.organization.id = :orgId OR t.category.organization.id = :orgId)")
                .setParameter("userId", user.getId())
                .setParameter("orgId", organizationId)
                .executeUpdate();

        // Close any running timer for this user in this organization
        entityManager.createQuery(
                "UPDATE TaskHistoryItemEntity h SET h.endAt = :now " +
                "WHERE h.endAt IS NULL AND (h.user.id = :userId OR (h.user IS NULL AND h.task.user.id = :userId)) AND " +
                "h.task.id IN (SELECT t.id FROM TaskEntity t WHERE t.organization.id = :orgId OR t.project.organization.id = :orgId OR t.category.organization.id = :orgId)")
                .setParameter("now", LocalDateTime.now())
                .setParameter("userId", user.getId())
                .setParameter("orgId", organizationId)
                .executeUpdate();

        LOGGER.infof("User %s successfully left organization %d", userEmail, organizationId);
    }
}

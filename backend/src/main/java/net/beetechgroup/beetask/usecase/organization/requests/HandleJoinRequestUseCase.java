package net.beetechgroup.beetask.usecase.organization.requests;

import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.usecase.organization.auth.AuthenticatedOrganizationUseCase;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;

import java.util.Optional;
import org.jboss.logging.Logger;

public class HandleJoinRequestUseCase extends AuthenticatedOrganizationUseCase<HandleJoinRequestUseCase.Input, Void> {
    private static final Logger LOGGER = Logger.getLogger(HandleJoinRequestUseCase.class);
    private final UserOrganizationRepository userOrganizationRepository;

    public HandleJoinRequestUseCase(AuthorizeOrganizationAdminUseCase authorizer,
                                   UserOrganizationRepository userOrganizationRepository) {
        super(authorizer);
        this.userOrganizationRepository = userOrganizationRepository;
    }

    @Override
    protected Void doExecute(Long organizationId, Input input) {
        Optional<UserOrganization> associationOptional = userOrganizationRepository.findByUserAndOrganization(input.userId(), organizationId);

        if (associationOptional.isEmpty()) {
            LOGGER.warnf("Join request handling failed because request for user %d in organization %d was not found",
                    input.userId(), organizationId);
            throw new RuntimeException("Request not found");
        }

        UserOrganization association = associationOptional.get();
        if (association.getStatus() != UserOrganizationStatus.PENDING) {
            LOGGER.warnf("Join request handling failed because request for user %d in organization %d is %s",
                    input.userId(), organizationId, association.getStatus());
            throw new RuntimeException("Request is not pending");
        }

        association.setStatus(input.approved() ? UserOrganizationStatus.ACTIVE : UserOrganizationStatus.REJECTED);
        userOrganizationRepository.save(association);
        LOGGER.infof("Join request for user %d in organization %d was %s",
                input.userId(), organizationId, input.approved() ? "approved" : "rejected");
        return null;
    }

    public record Input(Long userId, boolean approved) {}
}

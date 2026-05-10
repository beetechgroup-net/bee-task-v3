package net.beetechgroup.beetask.usecase.organization.requests;

import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.usecase.organization.auth.AuthenticatedOrganizationUseCase;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;

import java.util.List;
import java.util.stream.Collectors;
import org.jboss.logging.Logger;

public class ListPendingRequestsUseCase extends AuthenticatedOrganizationUseCase<Void, List<JoinRequestOutput>> {
    private static final Logger LOGGER = Logger.getLogger(ListPendingRequestsUseCase.class);
    private final UserOrganizationRepository userOrganizationRepository;

    public ListPendingRequestsUseCase(AuthorizeOrganizationAdminUseCase authorizer, 
                                     UserOrganizationRepository userOrganizationRepository) {
        super(authorizer);
        this.userOrganizationRepository = userOrganizationRepository;
    }

    @Override
    protected List<JoinRequestOutput> doExecute(Long organizationId, Void input) {
        List<UserOrganization> pending = userOrganizationRepository.findByOrganizationIdAndStatus(organizationId, UserOrganizationStatus.PENDING);
        List<JoinRequestOutput> requests = pending.stream()
                .map(uo -> new JoinRequestOutput(
                        uo.getUser().getId(),
                        uo.getUser().getName(),
                        uo.getUser().getEmail(),
                        uo.getUser().getPhoto()
                ))
                .collect(Collectors.toList());
        LOGGER.infof("Loaded %d pending requests for organization %d", requests.size(), organizationId);
        return requests;
    }
}

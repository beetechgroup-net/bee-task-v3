package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationUseCase;
import net.beetechgroup.beetask.usecase.organization.search.SearchOrganizationsUseCase;
import net.beetechgroup.beetask.usecase.organization.join.RequestJoinOrganizationUseCase;
import net.beetechgroup.beetask.usecase.organization.requests.ListPendingRequestsUseCase;
import net.beetechgroup.beetask.usecase.organization.requests.HandleJoinRequestUseCase;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

@ApplicationScoped
public class OrganizationUseCaseConfig {

    @Produces
    public AuthorizeOrganizationAdminUseCase authorizeOrganizationAdminUseCase(UserRepository userRepository,
                                                                             UserOrganizationRepository userOrganizationRepository) {
        return new AuthorizeOrganizationAdminUseCase(userRepository, userOrganizationRepository);
    }

    @Produces
    public CreateOrganizationUseCase createOrganizationUseCase(OrganizationRepository organizationRepository,
                                                             UserRepository userRepository,
                                                             UserOrganizationRepository userOrganizationRepository) {
        return new CreateOrganizationUseCase(organizationRepository, userRepository, userOrganizationRepository);
    }

    @Produces
    public SearchOrganizationsUseCase searchOrganizationsUseCase(OrganizationRepository organizationRepository) {
        return new SearchOrganizationsUseCase(organizationRepository);
    }

    @Produces
    public RequestJoinOrganizationUseCase requestJoinOrganizationUseCase(OrganizationRepository organizationRepository,
                                                                       UserRepository userRepository,
                                                                       UserOrganizationRepository userOrganizationRepository) {
        return new RequestJoinOrganizationUseCase(organizationRepository, userRepository, userOrganizationRepository);
    }

    @Produces
    public ListPendingRequestsUseCase listPendingRequestsUseCase(AuthorizeOrganizationAdminUseCase authorizer, 
                                                                UserOrganizationRepository userOrganizationRepository) {
        return new ListPendingRequestsUseCase(authorizer, userOrganizationRepository);
    }

    @Produces
    public HandleJoinRequestUseCase handleJoinRequestUseCase(AuthorizeOrganizationAdminUseCase authorizer, 
                                                           UserOrganizationRepository userOrganizationRepository) {
        return new HandleJoinRequestUseCase(authorizer, userOrganizationRepository);
    }
}
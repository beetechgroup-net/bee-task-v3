package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationUseCase;
import net.beetechgroup.beetask.usecase.organization.search.SearchOrganizationsUseCase;
import net.beetechgroup.beetask.usecase.organization.join.RequestJoinOrganizationUseCase;
import net.beetechgroup.beetask.usecase.organization.requests.ListPendingRequestsUseCase;
import net.beetechgroup.beetask.usecase.organization.requests.ListUserJoinRequestsUseCase;
import net.beetechgroup.beetask.usecase.organization.requests.HandleJoinRequestUseCase;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.organization.members.ListOrganizationMembersUseCase;
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
    public AuthorizeOrganizationMemberUseCase authorizeOrganizationMemberUseCase(UserRepository userRepository,
                                                                                 UserOrganizationRepository userOrganizationRepository) {
        return new AuthorizeOrganizationMemberUseCase(userRepository, userOrganizationRepository);
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

    @Produces
    public ListUserJoinRequestsUseCase listUserJoinRequestsUseCase(UserOrganizationRepository userOrganizationRepository,
                                                                 UserRepository userRepository) {
        return new ListUserJoinRequestsUseCase(userOrganizationRepository, userRepository);
    }

    @Produces
    public ListOrganizationMembersUseCase listOrganizationMembersUseCase(UserRepository userRepository,
                                                                         UserOrganizationRepository userOrganizationRepository) {
        return new ListOrganizationMembersUseCase(userRepository, userOrganizationRepository);
    }

    @Produces
    public net.beetechgroup.beetask.usecase.organization.members.RemoveOrganizationMemberUseCase removeOrganizationMemberUseCase(
            UserOrganizationRepository userOrganizationRepository,
            UserRepository userRepository,
            AuthorizeOrganizationAdminUseCase adminAuthorizer,
            jakarta.persistence.EntityManager entityManager) {
        return new net.beetechgroup.beetask.usecase.organization.members.RemoveOrganizationMemberUseCase(
                userOrganizationRepository, userRepository, adminAuthorizer, entityManager);
    }

    @Produces
    public net.beetechgroup.beetask.usecase.organization.members.LeaveOrganizationUseCase leaveOrganizationUseCase(
            UserOrganizationRepository userOrganizationRepository,
            UserRepository userRepository,
            AuthorizeOrganizationMemberUseCase memberAuthorizer,
            jakarta.persistence.EntityManager entityManager) {
        return new net.beetechgroup.beetask.usecase.organization.members.LeaveOrganizationUseCase(
                userOrganizationRepository, userRepository, memberAuthorizer, entityManager);
    }
}

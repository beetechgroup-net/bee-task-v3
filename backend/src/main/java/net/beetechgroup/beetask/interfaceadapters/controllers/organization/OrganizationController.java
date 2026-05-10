package net.beetechgroup.beetask.interfaceadapters.controllers.organization;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import org.eclipse.microprofile.openapi.annotations.Operation;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PATCH;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationInput;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationOutput;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationUseCase;
import net.beetechgroup.beetask.usecase.organization.search.SearchOrganizationsUseCase;
import net.beetechgroup.beetask.usecase.organization.search.SearchOrganizationOutput;
import net.beetechgroup.beetask.usecase.organization.join.RequestJoinOrganizationUseCase;
import net.beetechgroup.beetask.usecase.organization.requests.ListPendingRequestsUseCase;
import net.beetechgroup.beetask.usecase.organization.requests.ListUserJoinRequestsUseCase;
import net.beetechgroup.beetask.usecase.organization.requests.UserJoinRequestOutput;
import net.beetechgroup.beetask.usecase.organization.requests.JoinRequestOutput;
import net.beetechgroup.beetask.usecase.organization.requests.HandleJoinRequestUseCase;
import org.jboss.logging.Logger;

import java.util.List;

@Path("/organizations")
public class OrganizationController {
    private static final Logger LOGGER = Logger.getLogger(OrganizationController.class);

    @Inject
    CreateOrganizationUseCase createOrganizationUseCase;

    @Inject
    SearchOrganizationsUseCase searchOrganizationsUseCase;

    @Inject
    RequestJoinOrganizationUseCase requestJoinOrganizationUseCase;

    @Inject
    ListPendingRequestsUseCase listPendingRequestsUseCase;

    @Inject
    ListUserJoinRequestsUseCase listUserJoinRequestsUseCase;

    @Inject
    HandleJoinRequestUseCase handleJoinRequestUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @POST
    @Authenticated
    @Operation(summary = "Create organization", description = "Creates a new organization")
    public CreateOrganizationResponse createOrganization(CreateOrganizationRequest request) {
        String userEmail = securityIdentity.getPrincipal().getName();
        LOGGER.infof("User %s requested organization creation with name '%s'", userEmail, request.name());
        CreateOrganizationInput input = OrganizationControllerMapper.toCreateOrganizationInput(request, userEmail);
        CreateOrganizationOutput output = createOrganizationUseCase.execute(input);
        LOGGER.infof("Organization %d created successfully by user %s", output.id(), userEmail);
        return OrganizationControllerMapper.toCreateOrganizationResponse(output);
    }

    @GET
    @Path("/search")
    @Authenticated
    @Operation(summary = "Search organizations", description = "Search for organizations by name")
    public List<SearchOrganizationOutput> search(@QueryParam("q") String query) {
        List<SearchOrganizationOutput> organizations = searchOrganizationsUseCase.execute(query);
        LOGGER.infof("Organization search executed with query '%s' and returned %d results", query, organizations.size());
        return organizations;
    }

    @POST
    @Path("/{id}/join")
    @Authenticated
    @Operation(summary = "Request to join", description = "Request to join an organization")
    public void requestJoin(@PathParam("id") Long organizationId) {
        String userEmail = securityIdentity.getPrincipal().getName();
        LOGGER.infof("User %s requested to join organization %d", userEmail, organizationId);
        requestJoinOrganizationUseCase.execute(organizationId, userEmail);
        LOGGER.infof("Join request created for user %s in organization %d", userEmail, organizationId);
    }

    @GET
    @Path("/{id}/requests")
    @Authenticated
    @Operation(summary = "List pending requests", description = "List all pending join requests for an organization (Owner only)")
    public List<JoinRequestOutput> listRequests(@PathParam("id") Long organizationId) {
        String userEmail = securityIdentity.getPrincipal().getName();
        List<JoinRequestOutput> requests = listPendingRequestsUseCase.execute(userEmail, organizationId, null);
        LOGGER.infof("User %s listed %d pending requests for organization %d", userEmail, requests.size(), organizationId);
        return requests;
    }

    @PATCH
    @Path("/{id}/requests/{userId}/approve")
    @Authenticated
    @Operation(summary = "Approve request", description = "Approve a join request (Owner only)")
    public void approveRequest(@PathParam("id") Long organizationId, @PathParam("userId") Long userId) {
        String userEmail = securityIdentity.getPrincipal().getName();
        LOGGER.infof("User %s requested approval for user %d in organization %d", userEmail, userId, organizationId);
        handleJoinRequestUseCase.execute(userEmail, organizationId, new HandleJoinRequestUseCase.Input(userId, true));
        LOGGER.infof("Join request approved for user %d in organization %d by %s", userId, organizationId, userEmail);
    }

    @PATCH
    @Path("/{id}/requests/{userId}/reject")
    @Authenticated
    @Operation(summary = "Reject request", description = "Reject a join request (Owner only)")
    public void rejectRequest(@PathParam("id") Long organizationId, @PathParam("userId") Long userId) {
        String userEmail = securityIdentity.getPrincipal().getName();
        LOGGER.infof("User %s requested rejection for user %d in organization %d", userEmail, userId, organizationId);
        handleJoinRequestUseCase.execute(userEmail, organizationId, new HandleJoinRequestUseCase.Input(userId, false));
        LOGGER.infof("Join request rejected for user %d in organization %d by %s", userId, organizationId, userEmail);
    }

    @GET
    @Path("/my-requests")
    @Authenticated
    @Operation(summary = "List my requests", description = "List all join requests made by the current user")
    public List<UserJoinRequestOutput> listMyRequests() {
        String userEmail = securityIdentity.getPrincipal().getName();
        List<UserJoinRequestOutput> requests = listUserJoinRequestsUseCase.execute(userEmail);
        LOGGER.infof("User %s listed %d organization join requests", userEmail, requests.size());
        return requests;
    }
}

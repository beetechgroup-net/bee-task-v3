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
import jakarta.ws.rs.core.Response;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationInput;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationOutput;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationUseCase;
import net.beetechgroup.beetask.usecase.organization.search.SearchOrganizationsUseCase;
import net.beetechgroup.beetask.usecase.organization.search.SearchOrganizationOutput;
import net.beetechgroup.beetask.usecase.organization.join.RequestJoinOrganizationUseCase;
import net.beetechgroup.beetask.usecase.organization.requests.ListPendingRequestsUseCase;
import net.beetechgroup.beetask.usecase.organization.requests.JoinRequestOutput;
import net.beetechgroup.beetask.usecase.organization.requests.HandleJoinRequestUseCase;

import java.util.List;

@Path("/organizations")
public class OrganizationController {

    @Inject
    CreateOrganizationUseCase createOrganizationUseCase;

    @Inject
    SearchOrganizationsUseCase searchOrganizationsUseCase;

    @Inject
    RequestJoinOrganizationUseCase requestJoinOrganizationUseCase;

    @Inject
    ListPendingRequestsUseCase listPendingRequestsUseCase;

    @Inject
    HandleJoinRequestUseCase handleJoinRequestUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @POST
    @Authenticated
    @Operation(summary = "Create organization", description = "Creates a new organization")
    public CreateOrganizationResponse createOrganization(CreateOrganizationRequest request) {
        String userEmail = securityIdentity.getPrincipal().getName();
        CreateOrganizationInput input = OrganizationControllerMapper.toCreateOrganizationInput(request, userEmail);
        CreateOrganizationOutput output = createOrganizationUseCase.execute(input);
        return OrganizationControllerMapper.toCreateOrganizationResponse(output);
    }

    @GET
    @Path("/search")
    @Authenticated
    @Operation(summary = "Search organizations", description = "Search for organizations by name")
    public List<SearchOrganizationOutput> search(@QueryParam("q") String query) {
        return searchOrganizationsUseCase.execute(query);
    }

    @POST
    @Path("/{id}/join")
    @Authenticated
    @Operation(summary = "Request to join", description = "Request to join an organization")
    public void requestJoin(@PathParam("id") Long organizationId) {
        String userEmail = securityIdentity.getPrincipal().getName();
        requestJoinOrganizationUseCase.execute(organizationId, userEmail);
    }

    @GET
    @Path("/{id}/requests")
    @Authenticated
    @Operation(summary = "List pending requests", description = "List all pending join requests for an organization (Owner only)")
    public List<JoinRequestOutput> listRequests(@PathParam("id") Long organizationId) {
        String userEmail = securityIdentity.getPrincipal().getName();
        return listPendingRequestsUseCase.execute(userEmail, organizationId, null);
    }

    @PATCH
    @Path("/{id}/requests/{userId}/approve")
    @Authenticated
    @Operation(summary = "Approve request", description = "Approve a join request (Owner only)")
    public void approveRequest(@PathParam("id") Long organizationId, @PathParam("userId") Long userId) {
        String userEmail = securityIdentity.getPrincipal().getName();
        handleJoinRequestUseCase.execute(userEmail, organizationId, new HandleJoinRequestUseCase.Input(userId, true));
    }

    @PATCH
    @Path("/{id}/requests/{userId}/reject")
    @Authenticated
    @Operation(summary = "Reject request", description = "Reject a join request (Owner only)")
    public void rejectRequest(@PathParam("id") Long organizationId, @PathParam("userId") Long userId) {
        String userEmail = securityIdentity.getPrincipal().getName();
        handleJoinRequestUseCase.execute(userEmail, organizationId, new HandleJoinRequestUseCase.Input(userId, false));
    }
}

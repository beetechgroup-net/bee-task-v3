package net.beetechgroup.beetask.interfaceadapters.controllers.organization;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import org.eclipse.microprofile.openapi.annotations.Operation;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationInput;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationOutput;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationUseCase;

@Path("/organizations")
public class OrganizationController {

    @Inject
    CreateOrganizationUseCase createOrganizationUseCase;

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
}

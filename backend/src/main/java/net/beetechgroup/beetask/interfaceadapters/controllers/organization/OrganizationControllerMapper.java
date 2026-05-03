package net.beetechgroup.beetask.interfaceadapters.controllers.organization;

import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationInput;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationOutput;

public class OrganizationControllerMapper {
    public static CreateOrganizationInput toCreateOrganizationInput(CreateOrganizationRequest request) {
        return new CreateOrganizationInput(request.name());
    }

    public static CreateOrganizationResponse toCreateOrganizationResponse(CreateOrganizationOutput output) {
        return new CreateOrganizationResponse(output.id(), output.name());
    }
}

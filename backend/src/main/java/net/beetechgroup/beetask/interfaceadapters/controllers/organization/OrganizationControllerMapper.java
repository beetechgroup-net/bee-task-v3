package net.beetechgroup.beetask.interfaceadapters.controllers.organization;

import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationInput;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationOutput;

public class OrganizationControllerMapper {
    public static CreateOrganizationInput toCreateOrganizationInput(CreateOrganizationRequest request, String userEmail) {
        boolean isPrivate = request.isPrivate() != null ? request.isPrivate() : false;
        return new CreateOrganizationInput(request.name(), userEmail, isPrivate);
    }

    public static CreateOrganizationResponse toCreateOrganizationResponse(CreateOrganizationOutput output) {
        return new CreateOrganizationResponse(output.id(), output.name(), output.isPrivate());
    }
}

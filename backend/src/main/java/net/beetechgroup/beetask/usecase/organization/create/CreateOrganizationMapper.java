package net.beetechgroup.beetask.usecase.organization.create;

import net.beetechgroup.beetask.entities.organization.Organization;

public class CreateOrganizationMapper {
    public static CreateOrganizationOutput toCreateOrganizationOutput(Organization organization) {
        return new CreateOrganizationOutput(organization.getId(), organization.getName());
    }
}

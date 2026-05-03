package net.beetechgroup.beetask.usecase.organization.create;

import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;

public class CreateOrganizationUseCase {
    private final OrganizationRepository organizationRepository;

    public CreateOrganizationUseCase(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    public CreateOrganizationOutput execute(CreateOrganizationInput input) {
        Organization organization = new Organization();
        organization.setName(input.name());
        organizationRepository.saveOrganization(organization);
        return CreateOrganizationMapper.toCreateOrganizationOutput(organization);
    }
}

package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationUseCase;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;

@ApplicationScoped
public class OrganizationUseCaseConfig {

    @Produces
    public CreateOrganizationUseCase createOrganizationUseCase(OrganizationRepository organizationRepository) {
        return new CreateOrganizationUseCase(organizationRepository);
    }
}
package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.organization.create.CreateOrganizationUseCase;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

@ApplicationScoped
public class OrganizationUseCaseConfig {

    @Produces
    public CreateOrganizationUseCase createOrganizationUseCase(OrganizationRepository organizationRepository,
                                                             UserRepository userRepository,
                                                             UserOrganizationRepository userOrganizationRepository) {
        return new CreateOrganizationUseCase(organizationRepository, userRepository, userOrganizationRepository);
    }
}
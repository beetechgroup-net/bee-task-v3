package net.beetechgroup.beetask.usecase.organization.create;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationRole;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

import java.util.Optional;

public class CreateOrganizationUseCase {
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final UserOrganizationRepository userOrganizationRepository;

    public CreateOrganizationUseCase(OrganizationRepository organizationRepository,
                                     UserRepository userRepository,
                                     UserOrganizationRepository userOrganizationRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.userOrganizationRepository = userOrganizationRepository;
    }

    public CreateOrganizationOutput execute(CreateOrganizationInput input) {
        Optional<User> userOptional = userRepository.findByEmail(input.userEmail());
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found: " + input.userEmail());
        }
        User user = userOptional.get();

        Organization organization = new Organization();
        organization.setName(input.name());
        organization = organizationRepository.saveOrganization(organization);

        UserOrganization userOrganization = new UserOrganization();
        userOrganization.setUser(user);
        userOrganization.setOrganization(organization);
        userOrganization.setRole(UserOrganizationRole.OWNER);
        userOrganization.setStatus(UserOrganizationStatus.ACTIVE);
        userOrganizationRepository.save(userOrganization);

        return CreateOrganizationMapper.toCreateOrganizationOutput(organization);
    }
}

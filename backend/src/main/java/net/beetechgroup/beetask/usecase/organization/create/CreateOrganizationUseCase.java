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
import org.jboss.logging.Logger;

public class CreateOrganizationUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateOrganizationUseCase.class);
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
            LOGGER.warnf("Organization creation failed because user %s was not found", input.userEmail());
            throw new RuntimeException("User not found: " + input.userEmail());
        }
        User user = userOptional.get();

        LOGGER.infof("Creating organization '%s' for owner %s", input.name(), input.userEmail());
        Organization organization = new Organization();
        organization.setName(input.name());
        organization = organizationRepository.saveOrganization(organization);

        UserOrganization userOrganization = new UserOrganization();
        userOrganization.setUser(user);
        userOrganization.setOrganization(organization);
        userOrganization.setRole(UserOrganizationRole.OWNER);
        userOrganization.setStatus(UserOrganizationStatus.ACTIVE);
        userOrganizationRepository.save(userOrganization);
        LOGGER.infof("Organization %d created successfully with owner user %d", organization.getId(), user.getId());

        return CreateOrganizationMapper.toCreateOrganizationOutput(organization);
    }
}

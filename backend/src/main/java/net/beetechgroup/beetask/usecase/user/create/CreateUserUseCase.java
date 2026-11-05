package net.beetechgroup.beetask.usecase.user.create;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationRole;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

public class CreateUserUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateUserUseCase.class);

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final UserOrganizationRepository userOrganizationRepository;

    public CreateUserUseCase(UserRepository userRepository,
                             OrganizationRepository organizationRepository,
                             UserOrganizationRepository userOrganizationRepository) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.userOrganizationRepository = userOrganizationRepository;
    }

    public CreateUserOutput execute(CreateUserInput input) {
        if (userRepository.findByEmail(input.email()).isPresent()) {
            LOGGER.warnf("User creation rejected because email %s already exists", input.email());
            throw new RuntimeException("User already exists with this email");
        }

        LOGGER.infof("Creating user with email %s", input.email());
        User user = CreateUserMapper.toUser(input);
        if (user.getPassword() != null && !user.getPassword().isBlank()) {
            user.setPassword(org.mindrot.jbcrypt.BCrypt.hashpw(user.getPassword(), org.mindrot.jbcrypt.BCrypt.gensalt(10)));
        }
        User savedUser = userRepository.save(user);
        LOGGER.infof("User %d created successfully with email %s", savedUser.getId(), savedUser.getEmail());

        createDefaultWorkspaceForUser(savedUser);

        return CreateUserMapper.toCreateUserOutput(savedUser);
    }

    private void createDefaultWorkspaceForUser(User user) {
        String userName = user.getName() != null && !user.getName().isBlank() ? user.getName().trim() : "Meu";
        String baseWorkspaceName = "Workspace de " + userName;
        String uniqueWorkspaceName = baseWorkspaceName;
        int counter = 2;

        while (organizationRepository.findByNameIgnoreCase(uniqueWorkspaceName).isPresent()) {
            uniqueWorkspaceName = baseWorkspaceName + " (" + counter + ")";
            counter++;
        }

        LOGGER.infof("Creating initial workspace '%s' for newly registered user %d (%s)", uniqueWorkspaceName, user.getId(), user.getEmail());
        Organization organization = new Organization();
        organization.setName(uniqueWorkspaceName);
        organization = organizationRepository.saveOrganization(organization);

        UserOrganization userOrganization = new UserOrganization();
        userOrganization.setUser(user);
        userOrganization.setOrganization(organization);
        userOrganization.setRole(UserOrganizationRole.OWNER);
        userOrganization.setStatus(UserOrganizationStatus.ACTIVE);
        userOrganizationRepository.save(userOrganization);
        LOGGER.infof("Initial workspace %d ('%s') successfully linked to user %d", organization.getId(), uniqueWorkspaceName, user.getId());
    }
}

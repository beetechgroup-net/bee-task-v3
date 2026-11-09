package net.beetechgroup.beetask.usecase.organization.create;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationRole;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.TaskStatusRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

import java.util.Optional;
import org.jboss.logging.Logger;

public class CreateOrganizationUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateOrganizationUseCase.class);
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final UserOrganizationRepository userOrganizationRepository;
    private final TaskStatusRepository taskStatusRepository;

    public CreateOrganizationUseCase(OrganizationRepository organizationRepository,
                                     UserRepository userRepository,
                                     UserOrganizationRepository userOrganizationRepository,
                                     TaskStatusRepository taskStatusRepository) {
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.taskStatusRepository = taskStatusRepository;
    }

    public CreateOrganizationOutput execute(CreateOrganizationInput input) {
        String trimmedName = input.name() != null ? input.name().trim() : "";
        if (trimmedName.isBlank()) {
            LOGGER.warnf("Organization creation failed because name is blank");
            throw new IllegalArgumentException("O nome da organização é obrigatório.");
        }

        if (organizationRepository.findByNameIgnoreCase(trimmedName).isPresent()) {
            LOGGER.warnf("Organization creation rejected because name '%s' already exists", trimmedName);
            throw new IllegalStateException("Já existe uma organização com o nome '" + trimmedName + "'.");
        }

        Optional<User> userOptional = userRepository.findByEmail(input.userEmail());
        if (userOptional.isEmpty()) {
            LOGGER.warnf("Organization creation failed because user %s was not found", input.userEmail());
            throw new RuntimeException("User not found: " + input.userEmail());
        }
        User user = userOptional.get();

        LOGGER.infof("Creating organization '%s' (private=%b) for owner %s", trimmedName, input.isPrivate(), input.userEmail());
        Organization organization = new Organization();
        organization.setName(trimmedName);
        organization.setPrivate(input.isPrivate());
        organization = organizationRepository.saveOrganization(organization);

        UserOrganization userOrganization = new UserOrganization();
        userOrganization.setUser(user);
        userOrganization.setOrganization(organization);
        userOrganization.setRole(UserOrganizationRole.OWNER);
        userOrganization.setStatus(UserOrganizationStatus.ACTIVE);
        userOrganizationRepository.save(userOrganization);
        LOGGER.infof("Organization %d created successfully with owner user %d", organization.getId(), user.getId());

        // Create 4 default task statuses
        createDefaultTaskStatuses(organization);

        return CreateOrganizationMapper.toCreateOrganizationOutput(organization);
    }

    private void createDefaultTaskStatuses(Organization org) {
        taskStatusRepository.saveTaskStatus(new TaskStatus(null, "A Fazer", "#71717a", 0, true, false, false, org));
        taskStatusRepository.saveTaskStatus(new TaskStatus(null, "Em Andamento", "#14b8a6", 1, false, false, false, org));
        taskStatusRepository.saveTaskStatus(new TaskStatus(null, "Concluído", "#10b981", 2, false, true, false, org));
        taskStatusRepository.saveTaskStatus(new TaskStatus(null, "Cancelado", "#f43f5e", 3, false, false, true, org));
        LOGGER.infof("Created 4 default task statuses for organization %d", org.getId());
    }
}

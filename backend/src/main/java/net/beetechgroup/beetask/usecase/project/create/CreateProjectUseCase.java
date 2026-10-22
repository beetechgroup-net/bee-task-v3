package net.beetechgroup.beetask.usecase.project.create;

import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import org.jboss.logging.Logger;

public class CreateProjectUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateProjectUseCase.class);
    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public CreateProjectUseCase(ProjectRepository projectRepository,
                                OrganizationRepository organizationRepository,
                                AuthorizeOrganizationMemberUseCase authorizer) {
        this.projectRepository = projectRepository;
        this.organizationRepository = organizationRepository;
        this.authorizer = authorizer;
    }

    public Project execute(String userEmail, Long organizationId, String projectName, String color, String icon) {
        authorizer.execute(userEmail, organizationId);

        Organization organization = organizationRepository.findOrganizationById(organizationId)
                .orElseThrow(() -> {
                    LOGGER.warnf("Project creation failed because organization %d was not found", organizationId);
                    return new RuntimeException("Organization not found");
                });

        if (projectName == null || projectName.isBlank()) {
            throw new IllegalArgumentException("Nome do projeto não pode ser vazio.");
        }

        if (projectRepository.findByNameAndOrganizationId(projectName, organizationId).isPresent()) {
            throw new IllegalArgumentException("Já existe um projeto com este nome nesta organização.");
        }

        LOGGER.infof("Creating project '%s' in organization %d by user %s", projectName, organizationId, userEmail);
        Project project = new Project();
        project.setName(projectName.trim());
        project.setColor(color);
        project.setIcon(icon);
        project.setOrganization(organization);

        Project savedProject = projectRepository.saveProject(project);
        LOGGER.infof("Project %d created in organization %d", savedProject.getId(), organizationId);
        return savedProject;
    }
}


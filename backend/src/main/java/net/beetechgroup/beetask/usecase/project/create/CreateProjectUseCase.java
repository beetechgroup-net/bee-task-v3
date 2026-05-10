package net.beetechgroup.beetask.usecase.project.create;

import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import org.jboss.logging.Logger;

public class CreateProjectUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateProjectUseCase.class);
    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;

    public CreateProjectUseCase(ProjectRepository projectRepository, OrganizationRepository organizationRepository) {
        this.projectRepository = projectRepository;
        this.organizationRepository = organizationRepository;
    }

    public Project execute(Long organizationId, String projectName) {
        Organization organization = organizationRepository.findOrganizationById(organizationId)
                .orElseThrow(() -> {
                    LOGGER.warnf("Project creation failed because organization %d was not found", organizationId);
                    return new RuntimeException("Organization not found");
                });

        LOGGER.infof("Creating project '%s' in organization %d", projectName, organizationId);
        Project project = new Project();
        project.setName(projectName);
        project.setOrganization(organization);

        Project savedProject = projectRepository.saveProject(project);
        LOGGER.infof("Project %d created in organization %d", savedProject.getId(), organizationId);
        return savedProject;
    }
}

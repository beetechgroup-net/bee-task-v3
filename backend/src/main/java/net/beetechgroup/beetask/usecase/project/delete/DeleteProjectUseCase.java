package net.beetechgroup.beetask.usecase.project.delete;

import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import org.jboss.logging.Logger;

public class DeleteProjectUseCase {
    private static final Logger LOGGER = Logger.getLogger(DeleteProjectUseCase.class);

    private final ProjectRepository projectRepository;
    private final AuthorizeOrganizationAdminUseCase authorizer;

    public DeleteProjectUseCase(ProjectRepository projectRepository, AuthorizeOrganizationAdminUseCase authorizer) {
        this.projectRepository = projectRepository;
        this.authorizer = authorizer;
    }

    public void execute(String userEmail, Long organizationId, Long projectId) {
        authorizer.execute(userEmail, organizationId);

        Project project = projectRepository.findProjectById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Projeto não encontrado com ID: " + projectId));

        if (project.getOrganization() == null || !project.getOrganization().getId().equals(organizationId)) {
            throw new IllegalArgumentException("Projeto não pertence à organização informada.");
        }

        projectRepository.deleteProject(projectId);
        LOGGER.infof("Project %d soft deleted from org %d by %s", projectId, organizationId, userEmail);
    }
}

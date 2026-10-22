package net.beetechgroup.beetask.usecase.project.update;

import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import org.jboss.logging.Logger;

import java.util.Optional;

public class UpdateProjectUseCase {
    private static final Logger LOGGER = Logger.getLogger(UpdateProjectUseCase.class);

    private final ProjectRepository projectRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public UpdateProjectUseCase(ProjectRepository projectRepository, AuthorizeOrganizationMemberUseCase authorizer) {
        this.projectRepository = projectRepository;
        this.authorizer = authorizer;
    }

    public Project execute(String userEmail, Long organizationId, Long projectId, String name, String color, String icon) {
        authorizer.execute(userEmail, organizationId);

        Project project = projectRepository.findProjectById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Projeto não encontrado com ID: " + projectId));

        if (project.getOrganization() == null || !project.getOrganization().getId().equals(organizationId)) {
            throw new IllegalArgumentException("Projeto não pertence à organização informada.");
        }

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Nome do projeto não pode ser vazio.");
        }

        Optional<Project> duplicate = projectRepository.findByNameAndOrganizationId(name, organizationId);
        if (duplicate.isPresent() && !duplicate.get().getId().equals(projectId)) {
            throw new IllegalArgumentException("Já existe um projeto com este nome nesta organização.");
        }

        project.setName(name.trim());
        if (color != null) project.setColor(color);
        if (icon != null) project.setIcon(icon);

        Project updated = projectRepository.saveProject(project);
        LOGGER.infof("Project %d updated in org %d by %s", projectId, organizationId, userEmail);
        return updated;
    }
}

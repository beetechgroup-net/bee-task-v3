package net.beetechgroup.beetask.usecase.project.create;

import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;

public class CreateProjectUseCase {
    private final ProjectRepository projectRepository;
    private final OrganizationRepository organizationRepository;

    public CreateProjectUseCase(ProjectRepository projectRepository, OrganizationRepository organizationRepository) {
        this.projectRepository = projectRepository;
        this.organizationRepository = organizationRepository;
    }

    public Project execute(Long organizationId, String projectName) {
        Organization organization = organizationRepository.findOrganizationById(organizationId)
                .orElseThrow(() -> new RuntimeException("Organization not found"));

        Project project = new Project();
        project.setName(projectName);
        project.setOrganization(organization);

        return projectRepository.saveProject(project);
    }
}

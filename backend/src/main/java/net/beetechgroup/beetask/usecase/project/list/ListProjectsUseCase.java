package net.beetechgroup.beetask.usecase.project.list;

import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;

import java.util.List;

public class ListProjectsUseCase {
    private final ProjectRepository projectRepository;

    public ListProjectsUseCase(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> execute(Long organizationId) {
        return projectRepository.findByOrganizationId(organizationId);
    }
}

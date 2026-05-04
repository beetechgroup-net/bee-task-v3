package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.project.create.CreateProjectUseCase;
import net.beetechgroup.beetask.usecase.project.list.ListProjectsUseCase;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;

@ApplicationScoped
public class ProjectUseCaseConfig {

    @Produces
    public CreateProjectUseCase createProjectUseCase(ProjectRepository projectRepository, 
                                                   OrganizationRepository organizationRepository) {
        return new CreateProjectUseCase(projectRepository, organizationRepository);
    }

    @Produces
    public ListProjectsUseCase listProjectsUseCase(ProjectRepository projectRepository) {
        return new ListProjectsUseCase(projectRepository);
    }
}

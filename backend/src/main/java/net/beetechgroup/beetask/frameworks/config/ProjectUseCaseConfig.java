package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.project.create.CreateProjectUseCase;
import net.beetechgroup.beetask.usecase.project.list.ListProjectsUseCase;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;

@ApplicationScoped
public class ProjectUseCaseConfig {

    @Produces
    public CreateProjectUseCase createProjectUseCase(ProjectRepository projectRepository, 
                                                   OrganizationRepository organizationRepository,
                                                   AuthorizeOrganizationMemberUseCase authorizer) {
        return new CreateProjectUseCase(projectRepository, organizationRepository, authorizer);
    }

    @Produces
    public ListProjectsUseCase listProjectsUseCase(ProjectRepository projectRepository,
                                                   AuthorizeOrganizationMemberUseCase authorizer) {
        return new ListProjectsUseCase(projectRepository, authorizer);
    }

    @Produces
    public net.beetechgroup.beetask.usecase.project.update.UpdateProjectUseCase updateProjectUseCase(
            ProjectRepository projectRepository,
            AuthorizeOrganizationMemberUseCase authorizer) {
        return new net.beetechgroup.beetask.usecase.project.update.UpdateProjectUseCase(projectRepository, authorizer);
    }

    @Produces
    public net.beetechgroup.beetask.usecase.project.delete.DeleteProjectUseCase deleteProjectUseCase(
            ProjectRepository projectRepository,
            net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase authorizer) {
        return new net.beetechgroup.beetask.usecase.project.delete.DeleteProjectUseCase(projectRepository, authorizer);
    }
}


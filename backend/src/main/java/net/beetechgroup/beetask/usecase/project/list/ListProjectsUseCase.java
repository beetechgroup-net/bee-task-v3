package net.beetechgroup.beetask.usecase.project.list;

import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;

import java.util.List;
import org.jboss.logging.Logger;

public class ListProjectsUseCase {
    private static final Logger LOGGER = Logger.getLogger(ListProjectsUseCase.class);
    private final ProjectRepository projectRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public ListProjectsUseCase(ProjectRepository projectRepository, AuthorizeOrganizationMemberUseCase authorizer) {
        this.projectRepository = projectRepository;
        this.authorizer = authorizer;
    }

    public List<Project> execute(String userEmail, Long organizationId) {
        authorizer.execute(userEmail, organizationId);
        List<Project> projects = projectRepository.findByOrganizationId(organizationId);
        LOGGER.infof("Loaded %d projects for organization %d", projects.size(), organizationId);
        return projects;
    }
}


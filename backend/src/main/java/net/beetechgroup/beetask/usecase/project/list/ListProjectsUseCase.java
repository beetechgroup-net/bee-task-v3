package net.beetechgroup.beetask.usecase.project.list;

import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;

import java.util.List;
import org.jboss.logging.Logger;

public class ListProjectsUseCase {
    private static final Logger LOGGER = Logger.getLogger(ListProjectsUseCase.class);
    private final ProjectRepository projectRepository;

    public ListProjectsUseCase(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    public List<Project> execute(Long organizationId) {
        List<Project> projects = projectRepository.findByOrganizationId(organizationId);
        LOGGER.infof("Loaded %d projects for organization %d", projects.size(), organizationId);
        return projects;
    }
}

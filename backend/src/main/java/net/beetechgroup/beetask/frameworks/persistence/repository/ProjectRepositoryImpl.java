package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.frameworks.persistence.entities.ProjectEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.ProjectEntityMapper;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@ApplicationScoped
public class ProjectRepositoryImpl implements ProjectRepository, PanacheRepository<ProjectEntity> {
    private static final Logger LOGGER = Logger.getLogger(ProjectRepositoryImpl.class);

    @Override
    @Transactional
    public Project saveProject(Project project) {
        ProjectEntity entity = ProjectEntityMapper.toEntity(project);
        if (Objects.isNull(entity.getId())) {
            persist(entity);
        } else {
            entity = getEntityManager().merge(entity);
        }
        Project savedProject = ProjectEntityMapper.toDomain(entity);
        LOGGER.infof("Persisted project %d for organization %d", savedProject.getId(), savedProject.getOrganization().getId());
        return savedProject;
    }

    @Override
    public Optional<Project> findProjectById(Long id) {
        Optional<Project> project = findByIdOptional(id)
                .map(ProjectEntityMapper::toDomain);
        if (project.isEmpty()) {
            LOGGER.warnf("Project %d was not found", id);
        }
        return project;
    }

    @Override
    public List<Project> findByOrganizationId(Long organizationId) {
        List<Project> projects = find("organization.id", organizationId).stream()
                .map(ProjectEntityMapper::toDomain)
                .toList();
        LOGGER.infof("Loaded %d projects for organization %d from database", projects.size(), organizationId);
        return projects;
    }
}

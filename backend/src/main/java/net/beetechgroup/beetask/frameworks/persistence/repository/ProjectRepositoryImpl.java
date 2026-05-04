package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.frameworks.persistence.entities.ProjectEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.ProjectEntityMapper;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ProjectRepositoryImpl implements ProjectRepository, PanacheRepository<ProjectEntity> {

    @Override
    @Transactional
    public Project saveProject(Project project) {
        ProjectEntity entity = ProjectEntityMapper.toEntity(project);
        if (entity.getId() == null) {
            persist(entity);
        } else {
            entity = getEntityManager().merge(entity);
        }
        return ProjectEntityMapper.toDomain(entity);
    }

    @Override
    public Optional<Project> findProjectById(Long id) {
        return findByIdOptional(id)
                .map(ProjectEntityMapper::toDomain);
    }

    @Override
    public List<Project> findByOrganizationId(Long organizationId) {
        return find("organization.id", organizationId).stream()
                .map(ProjectEntityMapper::toDomain)
                .toList();
    }
}

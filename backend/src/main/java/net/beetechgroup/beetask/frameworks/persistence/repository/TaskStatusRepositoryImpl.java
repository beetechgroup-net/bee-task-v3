package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskStatusEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.TaskStatusEntityMapper;
import net.beetechgroup.beetask.usecase.repository.TaskStatusRepository;
import org.jboss.logging.Logger;

@ApplicationScoped
public class TaskStatusRepositoryImpl implements TaskStatusRepository, PanacheRepositoryBase<TaskStatusEntity, Long> {
    private static final Logger LOGGER = Logger.getLogger(TaskStatusRepositoryImpl.class);

    @Override
    public TaskStatus saveTaskStatus(TaskStatus taskStatus) {
        TaskStatusEntity entity = TaskStatusEntityMapper.toEntity(taskStatus);
        if (entity.getId() == null) {
            persist(entity);
        } else {
            entity = getEntityManager().merge(entity);
        }
        LOGGER.infof("Persisted task status %d ('%s') for organization %d",
                entity.getId(), entity.getName(), entity.getOrganization().getId());
        return TaskStatusEntityMapper.toDomain(entity);
    }

    @Override
    public Optional<TaskStatus> findTaskStatusById(Long id) {
        return findByIdOptional(id).map(TaskStatusEntityMapper::toDomain);
    }

    @Override
    public List<TaskStatus> findByOrganizationId(Long organizationId) {
        return find("organization.id = ?1 order by position asc, id asc", organizationId)
                .list()
                .stream()
                .map(TaskStatusEntityMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<TaskStatus> findDefaultByOrganizationId(Long organizationId) {
        return find("organization.id = ?1 and isDefault = true", organizationId)
                .firstResultOptional()
                .map(TaskStatusEntityMapper::toDomain);
    }

    @Override
    public Optional<TaskStatus> findByNameAndOrganizationId(String name, Long organizationId) {
        if (name == null || name.isBlank()) {
            return Optional.empty();
        }
        return find("organization.id = ?1 and lower(name) = ?2", organizationId, name.trim().toLowerCase())
                .firstResultOptional()
                .map(TaskStatusEntityMapper::toDomain);
    }

    @Override
    public boolean existsByNameInOrganization(Long organizationId, String name, Long excludeId) {
        if (name == null || name.isBlank()) {
            return false;
        }
        String trimmed = name.trim().toLowerCase();
        if (excludeId != null) {
            return count("organization.id = ?1 and lower(name) = ?2 and id != ?3", organizationId, trimmed, excludeId) > 0;
        }
        return count("organization.id = ?1 and lower(name) = ?2", organizationId, trimmed) > 0;
    }

    @Override
    public void deleteTaskStatus(TaskStatus taskStatus) {
        deleteById(taskStatus.getId());
        LOGGER.infof("Deleted task status %d", taskStatus.getId());
    }

    @Override
    public long countTasksByStatusId(Long statusId) {
        return getEntityManager()
                .createQuery("select count(t) from TaskEntity t where t.taskStatus.id = :statusId", Long.class)
                .setParameter("statusId", statusId)
                .getSingleResult();
    }

    @Override
    public void reassignTasks(Long fromStatusId, Long toStatusId) {
        TaskStatusEntity target = findById(toStatusId);
        if (target != null) {
            getEntityManager()
                    .createQuery("update TaskEntity t set t.taskStatus = :target, t.status = :targetName where t.taskStatus.id = :fromId")
                    .setParameter("target", target)
                    .setParameter("targetName", target.getName())
                    .setParameter("fromId", fromStatusId)
                    .executeUpdate();
            LOGGER.infof("Reassigned tasks from status %d to status %d ('%s')", fromStatusId, toStatusId, target.getName());
        }
    }
}

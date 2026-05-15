package net.beetechgroup.beetask.frameworks.persistence.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.time.LocalDateTime;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.TaskEntityMapper;
import net.beetechgroup.beetask.usecase.exceptions.TaskNotFoundException;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import org.jboss.logging.Logger;

@ApplicationScoped
public class TaskRepositoryImpl implements TaskRepository, PanacheRepository<TaskEntity> {
    private static final Logger LOGGER = Logger.getLogger(TaskRepositoryImpl.class);

    @Override
    @Transactional
    public Task saveTask(Task task) {
        TaskEntity entity = TaskEntityMapper.toEntity(task);
        if (Objects.isNull(entity.getId())) {
            persist(entity);
        } else {
            entity = getEntityManager().merge(entity);
        }
        Task savedTask = TaskEntityMapper.toDomain(entity);
        LOGGER.infof("Persisted task %d with status %s", savedTask.getId(), savedTask.getStatus());
        return savedTask;
    }

    @Override
    public Task findTaskById(Long id) {
        TaskEntity entity = find("id = ?1", id).firstResultOptional()
                .orElseThrow(() -> {
                    LOGGER.warnf("Task %d was not found in repository", id);
                    return new TaskNotFoundException(id);
                });
        return TaskEntityMapper.toDomain(entity);
    }

    @Override
    public List<Task> findAllTasks() {
        List<Task> tasks = findAll().list().stream().map(TaskEntityMapper::toDomain).toList();
        LOGGER.infof("Loaded %d tasks from database", tasks.size());
        return tasks;
    }

    @Override
    public List<Task> findTasksByUserFiltered(String email, String text, Long projectId, TaskStatus status) {
        StringBuilder query = new StringBuilder("user.email = ?1");
        List<Object> params = new ArrayList<>();
        params.add(email);

        int idx = 2;
        if (Objects.nonNull(text) && !text.isBlank()) {
            query.append(" and (lower(title) like ?").append(idx).append(" or lower(description) like ?").append(idx + 1).append(")");
            String pattern = "%" + text.toLowerCase() + "%";
            params.add(pattern);
            params.add(pattern);
            idx += 2;
        }
        if (Objects.nonNull(projectId)) {
            query.append(" and project.id = ?").append(idx);
            params.add(projectId);
            idx++;
        }
        if (Objects.nonNull(status)) {
            query.append(" and status = ?").append(idx);
            params.add(status);
        }

        List<Task> tasks = find(query.toString(), params.toArray()).list().stream().map(TaskEntityMapper::toDomain).toList();
        LOGGER.infof("Loaded %d tasks for user %s with filters (text=%s, projectId=%s, status=%s)", tasks.size(), email, text, projectId, status);
        return tasks;
    }

    @Override
    public List<Task> findTasksWorkedByUserInPeriod(String email, LocalDateTime start, LocalDateTime end) {
        return find("user.email = ?1", email).list().stream()
                .filter(entity -> entity.getHistory().stream().anyMatch(h ->
                        Objects.nonNull(h.getStartAt()) &&
                        !h.getStartAt().isAfter(end) &&
                        (Objects.isNull(h.getEndAt()) || !h.getEndAt().isBefore(start))))
                .map(TaskEntityMapper::toDomain)
                .toList();
    }

    @Override
    public List<Task> findTasksFinishedByUserInPeriod(String email, LocalDateTime start, LocalDateTime end) {
        return find("user.email = ?1 and status = ?2 and finishedAt >= ?3 and finishedAt <= ?4",
                email, TaskStatus.COMPLETED, start, end)
                .list().stream().map(TaskEntityMapper::toDomain).toList();
    }

    @Override
    public List<Task> findTasksByUser(String email) {
        List<Task> tasks = find("user.email = ?1", email).list().stream().map(TaskEntityMapper::toDomain).toList();
        LOGGER.infof("Loaded %d tasks for user %s", tasks.size(), email);
        return tasks;
    }

    @Override
    public List<Task> findTasksWorkedByOrgInPeriod(Long orgId, LocalDateTime start, LocalDateTime end) {
        return find("select distinct t from TaskEntity t join t.history h " +
                "where t.project.organization.id = ?1 " +
                "and h.startAt <= ?3 and (h.endAt is null or h.endAt >= ?2)",
                orgId, start, end).list().stream().map(TaskEntityMapper::toDomain).toList();
    }

    @Override
    public List<Task> findTasksFinishedByOrgInPeriod(Long orgId, LocalDateTime start, LocalDateTime end) {
        return find("select distinct t from TaskEntity t where t.project.organization.id = ?1 " +
                "and t.status = net.beetechgroup.beetask.entities.task.TaskStatus.COMPLETED " +
                "and t.finishedAt >= ?2 and t.finishedAt <= ?3",
                orgId, start, end).list().stream().map(TaskEntityMapper::toDomain).toList();
    }

    @Override
    public List<Task> findTasksWorkedByUserIdInPeriod(Long userId, LocalDateTime start, LocalDateTime end) {
        return find("user.id = ?1", userId).list().stream()
                .filter(entity -> entity.getHistory().stream().anyMatch(h ->
                        Objects.nonNull(h.getStartAt()) &&
                        !h.getStartAt().isAfter(end) &&
                        (Objects.isNull(h.getEndAt()) || !h.getEndAt().isBefore(start))))
                .map(TaskEntityMapper::toDomain)
                .toList();
    }

    @Override
    public List<Task> findTasksFinishedByUserIdInPeriod(Long userId, LocalDateTime start, LocalDateTime end) {
        return find("user.id = ?1 and status = ?2 and finishedAt >= ?3 and finishedAt <= ?4",
                userId, TaskStatus.COMPLETED, start, end)
                .list().stream().map(TaskEntityMapper::toDomain).toList();
    }

    @Override
    public List<Task> findTasksWorkedByUserEmailsInPeriod(List<String> emails, LocalDateTime start, LocalDateTime end) {
        if (emails.isEmpty()) {
            LOGGER.warn("Task search by user emails skipped because the email list is empty");
            return List.of();
        }
        return find("user.email in ?1", emails).list().stream()
                .filter(entity -> entity.getHistory().stream().anyMatch(h ->
                        Objects.nonNull(h.getStartAt()) &&
                        !h.getStartAt().isAfter(end) &&
                        (Objects.isNull(h.getEndAt()) || !h.getEndAt().isBefore(start))))
                .map(TaskEntityMapper::toDomain)
                .toList();
    }

    @Override
    public List<Task> findTasksFinishedByUserEmailsInPeriod(List<String> emails, LocalDateTime start, LocalDateTime end) {
        if (emails.isEmpty()) {
            LOGGER.warn("Finished task search by user emails skipped because the email list is empty");
            return List.of();
        }
        return find("user.email in ?1 and status = ?2 and finishedAt >= ?3 and finishedAt <= ?4",
                emails, TaskStatus.COMPLETED, start, end)
                .list().stream().map(TaskEntityMapper::toDomain).toList();
    }
}

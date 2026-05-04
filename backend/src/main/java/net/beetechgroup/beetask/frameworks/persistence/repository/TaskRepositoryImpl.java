package net.beetechgroup.beetask.frameworks.persistence.repository;

import java.util.List;
import java.time.LocalDateTime;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.TaskEntityMapper;
import net.beetechgroup.beetask.usecase.exceptions.TaskNotFoundException;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

@ApplicationScoped
public class TaskRepositoryImpl implements TaskRepository, PanacheRepository<TaskEntity> {

    @Override
    @Transactional
    public Task saveTask(Task task) {
        TaskEntity entity = TaskEntityMapper.toEntity(task);
        if (entity.getId() == null) {
            persist(entity);
        } else {
            entity = getEntityManager().merge(entity);
        }
        return TaskEntityMapper.toDomain(entity);
    }

    @Override
    public Task findTaskById(Long id) {
        TaskEntity entity = find("id = ?1", id).firstResultOptional()
                .orElseThrow(() -> new TaskNotFoundException(id));
        return TaskEntityMapper.toDomain(entity);
    }

    @Override
    public List<Task> findAllTasks() {
        return findAll().list().stream().map(TaskEntityMapper::toDomain).toList();
    }

    @Override
    public List<Task> findTasksWorkedByUserInPeriod(String email, LocalDateTime start, LocalDateTime end) {
        return find("select distinct t from TaskEntity t join t.history h where h.user.email = ?1 and h.startAt >= ?2 and h.startAt <= ?3",
                email, start, end).list().stream().map(TaskEntityMapper::toDomain).toList();
    }

    @Override
    public List<Task> findTasksFinishedByUserInPeriod(String email, LocalDateTime start, LocalDateTime end) {
        return find("select distinct t from TaskEntity t join t.history h where h.user.email = ?1 and t.finishedAt >= ?2 and t.finishedAt <= ?3",
                email, start, end).list().stream().map(TaskEntityMapper::toDomain).toList();
    }
}
package net.beetechgroup.beetask.frameworks.persistence.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.TaskMapper;
import net.beetechgroup.beetask.usecase.exceptions.TaskNotFoundException;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

@ApplicationScoped
public class TaskRepositoryImpl implements TaskRepository {

    @Inject
    EntityManager em;

    @Override
    @Transactional
    public Task save(Task task) {
        TaskEntity entity = TaskMapper.toEntity(task);
        if (entity.getId() == null) {
            em.persist(entity);
        } else {
            entity = em.merge(entity);
        }
        return TaskMapper.toDomain(entity);
    }

    @Override
    public Task findById(Long id) {
        TaskEntity entity = em.find(TaskEntity.class, id);
        if (entity == null) {
            throw new TaskNotFoundException("Task not found");
        }
        return TaskMapper.toDomain(entity);
    }
}
package net.beetechgroup.beetask.frameworks.persistence.repository;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.TaskMapper;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

@ApplicationScoped
public class TaskRepositoryImpl implements TaskRepository {

    @Inject
    EntityManager em;

    @Override
    @Transactional
    public Task save(Task task) {
        TaskEntity entity = TaskMapper.toEntity(task);
        em.persist(entity);
        return TaskMapper.toDomain(entity);
    }
}
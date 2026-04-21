package net.beetechgroup.beetask.frameworks.persistence.mapper;

import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskEntity;

public class TaskMapper {

    public static TaskEntity toEntity(Task task) {
        TaskEntity entity = new TaskEntity();
        entity.setId(task.getId());
        entity.setTitle(task.getTitle());
        entity.setDescription(task.getDescription());
        entity.setStatus(task.getStatus());
        entity.setProject(task.getProject());
        entity.setActivities(task.getActivities());
        return entity;
    }

    public static Task toDomain(TaskEntity entity) {
        if (entity == null) return null;

        Task task = new Task();
        task.setId(entity.getId());
        task.setTitle(entity.getTitle());
        task.setDescription(entity.getDescription());
        task.setStatus(entity.getStatus());
        task.setProject(entity.getProject());
        task.setActivities(entity.getActivities());

        return task;
    }
}
package net.beetechgroup.beetask.frameworks.persistence.mapper;

import java.util.ArrayList;
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
        entity.setHistory(new ArrayList<>(task.getHistory().stream().map(TaskHistoryItemMapper::toEntity).toList()));
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
        task.setHistory(new ArrayList<>(entity.getHistory().stream().map(TaskHistoryItemMapper::toDomain).toList()));

        return task;
    }
}
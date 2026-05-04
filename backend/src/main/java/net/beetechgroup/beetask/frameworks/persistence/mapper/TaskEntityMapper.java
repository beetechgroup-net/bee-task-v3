package net.beetechgroup.beetask.frameworks.persistence.mapper;

import java.util.ArrayList;

import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskEntity;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskHistoryItemEntity;

public class TaskEntityMapper {

    public static TaskEntity toEntity(Task task) {
        TaskEntity entity = new TaskEntity();
        entity.setId(task.getId());
        entity.setTitle(task.getTitle());
        entity.setDescription(task.getDescription());
        entity.setStatus(task.getStatus());
        entity.setFinishedAt(task.getFinishedAt());
        entity.setProject(ProjectEntityMapper.toEntity(task.getProject()));
        entity.setHistory(new ArrayList<>(task.getHistory().stream().map(h -> {
            TaskHistoryItemEntity he = TaskHistoryItemMapper.toEntity(h);
            he.setTask(entity);
            return he;
        }).toList()));
        return entity;
    }

    public static Task toDomain(TaskEntity entity) {
        if (entity == null) return null;

        Task task = new Task();
        task.setId(entity.getId());
        task.setTitle(entity.getTitle());
        task.setDescription(entity.getDescription());
        task.setStatus(entity.getStatus());
        task.setFinishedAt(entity.getFinishedAt());
        task.setProject(ProjectEntityMapper.toDomain(entity.getProject()));
        task.setHistory(new ArrayList<>(entity.getHistory().stream().map(TaskHistoryItemMapper::toDomain).toList()));

        return task;
    }
}
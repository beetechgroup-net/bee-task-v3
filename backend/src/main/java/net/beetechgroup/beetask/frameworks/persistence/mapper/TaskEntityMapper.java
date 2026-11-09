package net.beetechgroup.beetask.frameworks.persistence.mapper;

import java.util.ArrayList;
import java.util.Objects;

import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskEntity;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskHistoryItemEntity;

public class TaskEntityMapper {

    public static TaskEntity toEntity(Task task) {
        TaskEntity entity = new TaskEntity();
        entity.setId(task.getId());
        entity.setTitle(task.getTitle());
        entity.setDescription(task.getDescription());
        entity.setTaskStatus(TaskStatusEntityMapper.toEntity(task.getStatus()));
        entity.setStatus(task.getStatus() != null ? task.getStatus().getName() : null);
        entity.setFinishedAt(task.getFinishedAt());
        entity.setExternalUrl(task.getExternalUrl());
        entity.setOrganization(OrganizationEntityMapper.toEntity(task.getOrganization()));
        entity.setProject(ProjectEntityMapper.toEntity(task.getProject()));
        entity.setCategory(CategoryEntityMapper.toEntity(task.getCategory()));
        entity.setUser(UserEntityMapper.toEntity(task.getUser()));
        entity.setCreatedBy(UserEntityMapper.toEntity(task.getCreatedBy()));
        entity.setHistory(new ArrayList<>(task.getHistory().stream().map(h -> {
            TaskHistoryItemEntity he = TaskHistoryItemMapper.toEntity(h);
            he.setTask(entity);
            return he;
        }).toList()));
        return entity;
    }

    public static Task toDomain(TaskEntity entity) {
        if (Objects.isNull(entity)) return null;

        Task task = new Task();
        task.setId(entity.getId());
        task.setTitle(entity.getTitle());
        task.setDescription(entity.getDescription());
        if (entity.getTaskStatus() != null) {
            task.setStatus(TaskStatusEntityMapper.toDomain(entity.getTaskStatus()));
        } else if (entity.getStatus() != null) {
            TaskStatus fallback = new TaskStatus();
            fallback.setName(entity.getStatus());
            task.setStatus(fallback);
        }
        task.setFinishedAt(entity.getFinishedAt());
        task.setExternalUrl(entity.getExternalUrl());
        task.setOrganization(OrganizationEntityMapper.toDomain(entity.getOrganization()));
        task.setProject(ProjectEntityMapper.toDomain(entity.getProject()));
        task.setCategory(CategoryEntityMapper.toDomain(entity.getCategory()));
        task.setUser(UserEntityMapper.toDomain(entity.getUser()));
        task.setCreatedBy(UserEntityMapper.toDomain(entity.getCreatedBy()));
        task.setHistory(new ArrayList<>(entity.getHistory().stream().map(TaskHistoryItemMapper::toDomain).toList()));

        return task;
    }
}

package net.beetechgroup.beetask.frameworks.persistence.mapper;

import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskHistoryItemEntity;

public class TaskHistoryItemMapper {
    public static TaskHistoryItemEntity toEntity(TaskHistoryItem item) {
        TaskHistoryItemEntity entity = new TaskHistoryItemEntity();
        entity.setStartAt(item.getStartAt());
        entity.setEndAt(item.getEndAt());
        return entity;
    }

    public static TaskHistoryItem toDomain(TaskHistoryItemEntity entity) {
        if (entity == null) return null;

        TaskHistoryItem item = new TaskHistoryItem();
        item.setStartAt(entity.getStartAt());
        item.setEndAt(entity.getEndAt());
        return item;
    }
}
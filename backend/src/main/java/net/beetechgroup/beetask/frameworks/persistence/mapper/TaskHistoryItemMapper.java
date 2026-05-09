package net.beetechgroup.beetask.frameworks.persistence.mapper;

import java.util.Objects;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskHistoryItemEntity;

public class TaskHistoryItemMapper {
    public static TaskHistoryItemEntity toEntity(TaskHistoryItem item) {
        TaskHistoryItemEntity entity = new TaskHistoryItemEntity();
        entity.setId(item.getId());
        entity.setStartAt(item.getStartAt());
        entity.setEndAt(item.getEndAt());
        return entity;
    }

    public static TaskHistoryItem toDomain(TaskHistoryItemEntity entity) {
        if (Objects.isNull(entity)) return null;

        TaskHistoryItem item = new TaskHistoryItem();
        item.setId(entity.getId());
        item.setStartAt(entity.getStartAt());
        item.setEndAt(entity.getEndAt());
        return item;
    }
}

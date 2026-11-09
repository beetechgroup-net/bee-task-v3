package net.beetechgroup.beetask.frameworks.persistence.mapper;

import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.frameworks.persistence.entities.TaskStatusEntity;

public class TaskStatusEntityMapper {

    public static TaskStatusEntity toEntity(TaskStatus domain) {
        if (domain == null) return null;
        TaskStatusEntity entity = new TaskStatusEntity();
        entity.setId(domain.getId());
        entity.setName(domain.getName());
        entity.setColor(domain.getColor());
        entity.setPosition(domain.getPosition());
        entity.setDefault(domain.isDefault());
        entity.setCompleted(domain.isCompleted());
        entity.setCanceled(domain.isCanceled());
        if (domain.getOrganization() != null) {
            entity.setOrganization(OrganizationEntityMapper.toEntity(domain.getOrganization()));
        }
        return entity;
    }

    public static TaskStatus toDomain(TaskStatusEntity entity) {
        if (entity == null) return null;
        TaskStatus domain = new TaskStatus();
        domain.setId(entity.getId());
        domain.setName(entity.getName());
        domain.setColor(entity.getColor());
        domain.setPosition(entity.getPosition());
        domain.setDefault(entity.isDefault());
        domain.setCompleted(entity.isCompleted());
        domain.setCanceled(entity.isCanceled());
        if (entity.getOrganization() != null) {
            domain.setOrganization(OrganizationEntityMapper.toDomain(entity.getOrganization()));
        }
        return domain;
    }
}

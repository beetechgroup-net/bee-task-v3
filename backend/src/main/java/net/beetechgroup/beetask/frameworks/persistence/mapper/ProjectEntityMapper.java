package net.beetechgroup.beetask.frameworks.persistence.mapper;

import java.util.Objects;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.frameworks.persistence.entities.ProjectEntity;

public class ProjectEntityMapper {

    public static ProjectEntity toEntity(Project project) {
        if (Objects.isNull(project)) return null;
        ProjectEntity entity = new ProjectEntity();
        entity.setId(project.getId());
        entity.setName(project.getName());
        entity.setOrganization(OrganizationEntityMapper.toEntity(project.getOrganization()));
        return entity;
    }

    public static Project toDomain(ProjectEntity entity) {
        if (Objects.isNull(entity)) return null;

        Project project = new Project();
        project.setId(entity.getId());
        project.setName(entity.getName());
        project.setOrganization(OrganizationEntityMapper.toDomain(entity.getOrganization()));
        return project;
    }
}

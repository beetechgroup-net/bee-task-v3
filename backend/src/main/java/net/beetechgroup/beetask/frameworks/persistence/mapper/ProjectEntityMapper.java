package net.beetechgroup.beetask.frameworks.persistence.mapper;

import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.frameworks.persistence.entities.ProjectEntity;

public class ProjectEntityMapper {

    public static ProjectEntity toEntity(Project project) {
        if (project == null) return null;
        ProjectEntity entity = new ProjectEntity();
        entity.setId(project.getId());
        entity.setName(project.getName());
        return entity;
    }

    public static Project toDomain(ProjectEntity entity) {
        if (entity == null) return null;

        Project project = new Project();
        project.setId(entity.getId());
        project.setName(entity.getName());
        return project;
    }
}

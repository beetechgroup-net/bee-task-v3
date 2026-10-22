package net.beetechgroup.beetask.usecase.repository;

import net.beetechgroup.beetask.entities.Project;
import java.util.List;
import java.util.Optional;

public interface ProjectRepository {
    Project saveProject(Project project);
    Optional<Project> findProjectById(Long id);
    List<Project> findByOrganizationId(Long organizationId);
    Optional<Project> findByNameAndOrganizationId(String name, Long organizationId);
    void deleteProject(Long id);
}

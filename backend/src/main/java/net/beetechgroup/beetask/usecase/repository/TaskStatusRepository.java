package net.beetechgroup.beetask.usecase.repository;

import java.util.List;
import java.util.Optional;
import net.beetechgroup.beetask.entities.task.TaskStatus;

public interface TaskStatusRepository {
    TaskStatus saveTaskStatus(TaskStatus taskStatus);
    Optional<TaskStatus> findTaskStatusById(Long id);
    List<TaskStatus> findByOrganizationId(Long organizationId);
    Optional<TaskStatus> findDefaultByOrganizationId(Long organizationId);
    Optional<TaskStatus> findByNameAndOrganizationId(String name, Long organizationId);
    boolean existsByNameInOrganization(Long organizationId, String name, Long excludeId);
    void deleteTaskStatus(TaskStatus taskStatus);
    long countTasksByStatusId(Long statusId);
    void reassignTasks(Long fromStatusId, Long toStatusId);
}

package net.beetechgroup.beetask.usecase.repository;

import java.util.List;
import java.time.LocalDateTime;

import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskStatus;

public interface TaskRepository {
    Task saveTask(Task task);
    Task findTaskById(Long id);
    List<Task> findAllTasks();
    List<Task> findAccessibleTasksFiltered(Long organizationId, String text, List<Long> projectIds,
                                           List<TaskStatus> statuses, List<Long> categoryIds, List<Long> userIds);
    List<Task> findRunningTasksByUserEmail(String email);
    List<Task> findTasksWorkedByUserInPeriod(String email, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksWorkedByUserInPeriod(String email, LocalDateTime start, LocalDateTime end, Long organizationId);
    List<Task> findTasksFinishedByUserInPeriod(String email, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksByUser(String email);
    List<Task> findTasksByUserFiltered(String email, String text, List<Long> projectIds,
                                       List<TaskStatus> statuses, List<Long> categoryIds);
    List<Task> findTasksWorkedByOrgInPeriod(Long orgId, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksFinishedByOrgInPeriod(Long orgId, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksWorkedByUserIdInPeriod(Long userId, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksWorkedByUserIdInPeriod(Long orgId, Long userId, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksFinishedByUserIdInPeriod(Long userId, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksFinishedByUserIdInPeriod(Long orgId, Long userId, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksWorkedByUserEmailsInPeriod(List<String> emails, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksWorkedByUserEmailsInPeriod(Long orgId, List<String> emails, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksFinishedByUserEmailsInPeriod(List<String> emails, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksFinishedByUserEmailsInPeriod(Long orgId, List<String> emails, LocalDateTime start, LocalDateTime end);
    long countByStatus(TaskStatus status);
    long sumAllCompletedTrackedMinutes();
    void deleteTask(Long id);
}

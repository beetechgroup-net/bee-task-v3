package net.beetechgroup.beetask.usecase.repository;

import java.util.List;
import java.time.LocalDateTime;

import net.beetechgroup.beetask.entities.task.Task;

public interface TaskRepository {
    Task saveTask(Task task);
    Task findTaskById(Long id);
    List<Task> findAllTasks();
    List<Task> findTasksWorkedByUserInPeriod(String email, LocalDateTime start, LocalDateTime end);
    List<Task> findTasksFinishedByUserInPeriod(String email, LocalDateTime start, LocalDateTime end);
}
package net.beetechgroup.beetask.usecase.repository;

import java.util.List;

import net.beetechgroup.beetask.entities.Task;

public interface TaskRepository {
    Task saveTask(Task task);
    Task findTaskById(Long id);
    List<Task> findAllTasks();
}
package net.beetechgroup.beetask.usecase.repository;

import net.beetechgroup.beetask.entities.Task;

public interface TaskRepository {
    Task save(Task task);
    Task findById(Long id);
}
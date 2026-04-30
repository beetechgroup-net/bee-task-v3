package net.beetechgroup.beetask.usecase.task.listall;

import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

import java.util.List;

public class ListAllTasksUseCase {

    private final TaskRepository taskRepository;

    public ListAllTasksUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public List<Task> execute() {
        return taskRepository.findAllTasks();
    }
}

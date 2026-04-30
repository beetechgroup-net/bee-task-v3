package net.beetechgroup.beetask.usecase.task.start;

import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

public class StartTaskUseCase {

    private final TaskRepository taskRepository;

    public StartTaskUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task execute(StartTaskInput input) {
        Task task = taskRepository.findTaskById(input.id());
        task.start();
        return taskRepository.saveTask(task);
    }
}

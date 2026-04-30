package net.beetechgroup.beetask.usecase.task.create;

import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

public class CreateTaskUseCase {
    private final TaskRepository taskRepository;

    public CreateTaskUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task execute(CreateTaskInput input) {
        Task task = new Task();
        task.setTitle(input.title());
        task.setDescription(input.description());
        task.setStatus(input.status());
        task.setProject(input.project());
        return taskRepository.saveTask(task);
    }
}

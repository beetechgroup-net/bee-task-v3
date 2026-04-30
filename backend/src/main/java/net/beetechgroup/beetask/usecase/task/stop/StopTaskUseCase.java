package net.beetechgroup.beetask.usecase.task.stop;

import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

public class StopTaskUseCase {

    private final TaskRepository taskRepository;

    public StopTaskUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task execute(StopTaskInput input) {
        Task task = taskRepository.findById(input.id());
        task.stop();
        return taskRepository.save(task);
    }
}

package net.beetechgroup.beetask.usecase.task.update;

import net.beetechgroup.beetask.entities.Task;
import net.beetechgroup.beetask.entities.TaskStatus;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

public class UpdateTaskStatusUseCase {

    private final TaskRepository taskRepository;

    public UpdateTaskStatusUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task execute(Long id, TaskStatus newStatus) {
        Task task = taskRepository.findTaskById(id);
        
        // Simple status update
        // In a more complex scenario, we might want to trigger start() or stop() logic here
        task.setStatus(newStatus);
        
        return taskRepository.saveTask(task);
    }
}

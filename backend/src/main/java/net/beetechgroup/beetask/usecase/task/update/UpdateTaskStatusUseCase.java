package net.beetechgroup.beetask.usecase.task.update;



import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;

public class UpdateTaskStatusUseCase {

    private final TaskRepository taskRepository;

    public UpdateTaskStatusUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public CreateTaskOutput execute(Long id, TaskStatus newStatus) {
        Task task = taskRepository.findTaskById(id);

        task.setStatus(newStatus);
        
        return CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
    }
}

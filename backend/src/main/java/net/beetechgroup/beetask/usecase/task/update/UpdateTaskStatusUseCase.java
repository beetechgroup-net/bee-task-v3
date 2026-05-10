package net.beetechgroup.beetask.usecase.task.update;



import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

public class UpdateTaskStatusUseCase {
    private static final Logger LOGGER = Logger.getLogger(UpdateTaskStatusUseCase.class);

    private final TaskRepository taskRepository;

    public UpdateTaskStatusUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public CreateTaskOutput execute(Long id, TaskStatus newStatus) {
        LOGGER.infof("Updating status for task %d to %s", id, newStatus);
        Task task = taskRepository.findTaskById(id);

        task.setStatus(newStatus);

        CreateTaskOutput output = CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
        LOGGER.infof("Status updated for task %d to %s", id, newStatus);
        return output;
    }
}

package net.beetechgroup.beetask.usecase.task.get;

import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

public class GetTaskUseCase {
    private static final Logger LOGGER = Logger.getLogger(GetTaskUseCase.class);
    private final TaskRepository taskRepository;

    public GetTaskUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public CreateTaskOutput execute(Long id) {
        //TODO deve validar se o usuario logado é o dono da task
        LOGGER.infof("Fetching task %d", id);
        return CreateTaskMapper.toCreateTaskOutput(taskRepository.findTaskById(id));
    }
}

package net.beetechgroup.beetask.usecase.task.start;

import java.util.Objects;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;
import org.jboss.logging.Logger;

public class StartTaskUseCase {
    private static final Logger LOGGER = Logger.getLogger(StartTaskUseCase.class);

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public StartTaskUseCase(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    public CreateTaskOutput execute(StartTaskInput input) {
        LOGGER.infof("Starting task %d for user %s", input.id(), input.userEmail());
        Task task = taskRepository.findTaskById(input.id());

        if (Objects.nonNull(task.getUser()) && !task.getUser().getEmail().equals(input.userEmail())) {
            LOGGER.warnf("User %s attempted to start task %d owned by %s",
                    input.userEmail(), input.id(), task.getUser().getEmail());
            throw new SecurityException("Você não tem permissão para iniciar esta tarefa.");
        }

        task.start();
        CreateTaskOutput output = CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
        LOGGER.infof("Task %d started successfully", input.id());
        return output;
    }
}

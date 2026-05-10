package net.beetechgroup.beetask.usecase.task.create;

import java.util.Objects;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

public class CreateTaskUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateTaskUseCase.class);
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public CreateTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public CreateTaskOutput execute(CreateTaskInput input) {
        LOGGER.infof("Creating task '%s' for user %s", input.title(), input.userEmail());
        Task task = new Task();
        task.setTitle(input.title());
        task.setDescription(input.description());
        task.setStatus(input.status());

        if (Objects.nonNull(input.projectId())) {
            Project project = projectRepository.findProjectById(input.projectId())
                    .orElseThrow(() -> {
                        LOGGER.warnf("Task creation failed because project %d was not found", input.projectId());
                        return new IllegalArgumentException("Projeto não encontrado com ID: " + input.projectId());
                    });
            task.setProject(project);
        }

        task.setUser(userRepository.findByEmail(input.userEmail())
                .orElseThrow(() -> {
                    LOGGER.warnf("Task creation failed because user %s was not found", input.userEmail());
                    return new IllegalArgumentException("Usuário não encontrado: " + input.userEmail());
                }));

        CreateTaskOutput output = CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
        LOGGER.infof("Task %d created for user %s", output.id(), input.userEmail());
        return output;
    }
}

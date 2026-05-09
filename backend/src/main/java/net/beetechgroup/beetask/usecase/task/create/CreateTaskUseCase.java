package net.beetechgroup.beetask.usecase.task.create;

import java.util.Objects;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

public class CreateTaskUseCase {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public CreateTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    public CreateTaskOutput execute(CreateTaskInput input) {
        Task task = new Task();
        task.setTitle(input.title());
        task.setDescription(input.description());
        task.setStatus(input.status());

        if (Objects.nonNull(input.projectId())) {
            Project project = projectRepository.findProjectById(input.projectId())
                    .orElseThrow(() -> new IllegalArgumentException("Projeto não encontrado com ID: " + input.projectId()));
            task.setProject(project);
        }

        task.setUser(userRepository.findByEmail(input.userEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + input.userEmail())));

        return CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
    }
}

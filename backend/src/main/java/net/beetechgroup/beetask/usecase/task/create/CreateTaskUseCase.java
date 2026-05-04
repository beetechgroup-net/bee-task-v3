package net.beetechgroup.beetask.usecase.task.create;

import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

public class CreateTaskUseCase {
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public CreateTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
    }

    public CreateTaskOutput execute(CreateTaskInput input) {
        Task task = new Task();
        task.setTitle(input.title());
        task.setDescription(input.description());
        task.setStatus(input.status());

        if (input.projectId() != null) {
            Project project = projectRepository.findProjectById(input.projectId())
                    .orElseThrow(() -> new IllegalArgumentException("Projeto não encontrado com ID: " + input.projectId()));
            task.setProject(project);
        }

        return CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
    }
}

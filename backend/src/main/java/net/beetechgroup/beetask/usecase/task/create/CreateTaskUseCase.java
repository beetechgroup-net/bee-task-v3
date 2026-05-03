package net.beetechgroup.beetask.usecase.task.create;

import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

public class CreateTaskUseCase {
    private final TaskRepository taskRepository;

    public CreateTaskUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public CreateTaskOutput execute(CreateTaskInput input) {
        Task task = new Task();
        task.setTitle(input.title());
        task.setDescription(input.description());
        task.setStatus(input.status());
        if (input.projectId() != null) {
            Project project = new Project();
            project.setId(input.projectId());
            task.setProject(project);
        }
        return CreateTaskMapper.toCreateTaskOutput(taskRepository.saveTask(task));
    }
}

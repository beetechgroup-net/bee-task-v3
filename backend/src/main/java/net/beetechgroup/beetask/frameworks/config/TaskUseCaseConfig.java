package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.listall.ListAllTasksUseCase;
import net.beetechgroup.beetask.usecase.task.start.StartTaskUseCase;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskStatusUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.get.GetTaskUseCase;

@ApplicationScoped
public class TaskUseCaseConfig {

    @Produces
    public CreateTaskUseCase createTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository) {
        return new CreateTaskUseCase(taskRepository, projectRepository);
    }

    @Produces
    public StartTaskUseCase startTaskUseCase(TaskRepository taskRepository, UserRepository userRepository) {
        return new StartTaskUseCase(taskRepository, userRepository);
    }

    @Produces
    public StopTaskUseCase stopTaskUseCase(TaskRepository taskRepository) {
        return new StopTaskUseCase(taskRepository);
    }

    @Produces
    public ListAllTasksUseCase listAllTasksUseCase(TaskRepository taskRepository) {
        return new ListAllTasksUseCase(taskRepository);
    }

    @Produces
    public UpdateTaskStatusUseCase updateTaskStatusUseCase(TaskRepository taskRepository) {
        return new UpdateTaskStatusUseCase(taskRepository);
    }

    @Produces
    public UpdateTaskUseCase updateTaskUseCase(TaskRepository taskRepository, ProjectRepository projectRepository) {
        return new UpdateTaskUseCase(taskRepository, projectRepository);
    }

    @Produces
    public GetTaskUseCase getTaskUseCase(TaskRepository taskRepository) {
        return new GetTaskUseCase(taskRepository);
    }
}

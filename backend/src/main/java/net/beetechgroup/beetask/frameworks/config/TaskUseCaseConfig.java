package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.listall.ListAllTasksUseCase;
import net.beetechgroup.beetask.usecase.task.start.StartTaskUseCase;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskUseCase;
import net.beetechgroup.beetask.usecase.task.update.UpdateTaskStatusUseCase;

@ApplicationScoped
public class TaskUseCaseConfig {

    @Produces
    public CreateTaskUseCase createTaskUseCase(TaskRepository taskRepository) {
        return new CreateTaskUseCase(taskRepository);
    }

    @Produces
    public StartTaskUseCase startTaskUseCase(TaskRepository taskRepository) {
        return new StartTaskUseCase(taskRepository);
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
}

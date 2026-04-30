package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskUseCase;
import net.beetechgroup.beetask.usecase.task.start.StartTaskUseCase;
import net.beetechgroup.beetask.usecase.task.stop.StopTaskUseCase;

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
}

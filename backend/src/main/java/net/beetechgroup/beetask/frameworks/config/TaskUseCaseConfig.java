package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.createtask.CreateTaskUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

@ApplicationScoped
public class TaskUseCaseConfig {

    @Produces
    public CreateTaskUseCase createTaskUseCase(TaskRepository taskRepository) {
        return new CreateTaskUseCase(taskRepository);
    }
}

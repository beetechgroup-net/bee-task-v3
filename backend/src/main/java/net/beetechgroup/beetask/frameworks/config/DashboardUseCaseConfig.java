package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.dashboard.DashboardUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;

@ApplicationScoped
public class DashboardUseCaseConfig {

    @Produces
    public DashboardUseCase dashboardUseCase(TaskRepository taskRepository) {
        return new DashboardUseCase(taskRepository);
    }
}

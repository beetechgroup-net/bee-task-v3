package net.beetechgroup.beetask.frameworks.config;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import net.beetechgroup.beetask.usecase.publicstats.PublicStatsUseCase;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

@ApplicationScoped
public class PublicStatsUseCaseConfig {
    @Produces
    public PublicStatsUseCase publicStatsUseCase(
            UserRepository userRepository,
            OrganizationRepository organizationRepository,
            TaskRepository taskRepository) {
        return new PublicStatsUseCase(userRepository, organizationRepository, taskRepository);
    }
}

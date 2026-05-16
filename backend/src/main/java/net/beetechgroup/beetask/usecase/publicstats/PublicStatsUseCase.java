package net.beetechgroup.beetask.usecase.publicstats;

import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

public class PublicStatsUseCase {
    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final TaskRepository taskRepository;

    public PublicStatsUseCase(UserRepository userRepository, OrganizationRepository organizationRepository, TaskRepository taskRepository) {
        this.userRepository = userRepository;
        this.organizationRepository = organizationRepository;
        this.taskRepository = taskRepository;
    }

    public PublicStatsOutput execute() {
        long totalUsers = userRepository.countAll();
        long totalOrganizations = organizationRepository.countAll();
        long totalCompletedTasks = taskRepository.countByStatus(TaskStatus.COMPLETED);
        double totalTrackedHours = taskRepository.sumAllCompletedTrackedMinutes() / 60.0;

        return new PublicStatsOutput(totalUsers, totalOrganizations, totalCompletedTasks, totalTrackedHours);
    }
}

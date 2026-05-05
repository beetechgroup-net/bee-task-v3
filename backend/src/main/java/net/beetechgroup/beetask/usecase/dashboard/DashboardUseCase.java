package net.beetechgroup.beetask.usecase.dashboard;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;

public class DashboardUseCase {

    private final TaskRepository taskRepository;

    public DashboardUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public DashboardOutput execute(DashboardInput input) {
        // 1. Fetch tasks worked by user in period
        List<Task> workedTasks = taskRepository.findTasksWorkedByUserInPeriod(
            input.userEmail(), input.startDate(), input.endDate()
        );

        // 2. Fetch tasks finished by user in period
        List<Task> finishedTasks = taskRepository.findTasksFinishedByUserInPeriod(
            input.userEmail(), input.startDate(), input.endDate()
        );

        // 3. Yesterday's tasks
        LocalDateTime startOfYesterday = LocalDateTime.now().minusDays(1).with(LocalTime.MIN);
        LocalDateTime endOfYesterday = LocalDateTime.now().minusDays(1).with(LocalTime.MAX);
        List<Task> yesterdayTasks = taskRepository.findTasksWorkedByUserInPeriod(
            input.userEmail(), startOfYesterday, endOfYesterday
        );

        // Calculate total minutes and project stats
        long totalMinutes = 0;
        Map<Long, DashboardProjectStats> projectStatsMap = new HashMap<>();

        for (Task task : workedTasks) {
            long taskMinutesInPeriod = task.getHistory().stream()
                .filter(h -> h.getUser() != null && h.getUser().getEmail().equals(input.userEmail()))
                .filter(h -> isWithinPeriod(h, input.startDate(), input.endDate()))
                .mapToLong(h -> calculateMinutesInRange(h, input.startDate(), input.endDate()))
                .sum();

            totalMinutes += taskMinutesInPeriod;

            if (task.getProject() != null) {
                Long projectId = task.getProject().getId();
                DashboardProjectStats stats = projectStatsMap.getOrDefault(projectId, 
                    new DashboardProjectStats(projectId, task.getProject().getName(), 0L));
                
                projectStatsMap.put(projectId, new DashboardProjectStats(
                    projectId, 
                    stats.projectName(), 
                    stats.totalMinutes() + taskMinutesInPeriod
                ));
            }
        }

        return new DashboardOutput(
            totalMinutes,
            new ArrayList<>(projectStatsMap.values()),
            yesterdayTasks.stream().map(CreateTaskMapper::toCreateTaskOutput).toList(),
            finishedTasks.stream().map(CreateTaskMapper::toCreateTaskOutput).toList()
        );
    }

    private boolean isWithinPeriod(TaskHistoryItem item, LocalDateTime start, LocalDateTime end) {
        if (item.getStartAt() == null) return false;
        // If it started after end or ended before start, it's out
        if (item.getStartAt().isAfter(end)) return false;
        if (item.getEndAt() != null && item.getEndAt().isBefore(start)) return false;
        return true;
    }

    private long calculateMinutesInRange(TaskHistoryItem item, LocalDateTime start, LocalDateTime end) {
        LocalDateTime effectiveStart = item.getStartAt().isBefore(start) ? start : item.getStartAt();
        LocalDateTime effectiveEnd = item.getEndAt() == null || item.getEndAt().isAfter(end) ? end : item.getEndAt();

        if (effectiveStart.isAfter(effectiveEnd)) return 0;

        return Duration.between(effectiveStart, effectiveEnd).toMinutes();
    }
}

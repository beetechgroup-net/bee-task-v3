package net.beetechgroup.beetask.usecase.dashboard;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskMapper;
import org.jboss.logging.Logger;

public class DashboardUseCase {
    private static final Logger LOGGER = Logger.getLogger(DashboardUseCase.class);

    private final TaskRepository taskRepository;

    public DashboardUseCase(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public DashboardOutput execute(DashboardInput input) {
        LOGGER.infof("Calculating dashboard for user %s in period %s to %s",
                input.userEmail(), input.startDate(), input.endDate());
        List<Task> workedTasks = taskRepository.findTasksWorkedByUserInPeriod(
            input.userEmail(), input.startDate(), input.endDate()
        );

        List<Task> finishedTasks = taskRepository.findTasksFinishedByUserInPeriod(
            input.userEmail(), input.startDate(), input.endDate()
        );

        LocalDateTime startOfYesterday = LocalDateTime.now().minusDays(1).with(LocalTime.MIN);
        LocalDateTime endOfYesterday = LocalDateTime.now().minusDays(1).with(LocalTime.MAX);
        List<Task> yesterdayTasks = taskRepository.findTasksWorkedByUserInPeriod(
            input.userEmail(), startOfYesterday, endOfYesterday
        );

        long totalMinutes = 0;
        Map<Long, DashboardProjectStats> projectStatsMap = new HashMap<>();
        Map<Long, DashboardCategoryStats> categoryStatsMap = new HashMap<>();

        for (Task task : workedTasks) {
            long taskMinutesInPeriod = task.getHistory().stream()
                .filter(h -> isWithinPeriod(h, input.startDate(), input.endDate()))
                .mapToLong(h -> calculateMinutesInRange(h, input.startDate(), input.endDate()))
                .sum();

            totalMinutes += taskMinutesInPeriod;

            if (Objects.nonNull(task.getProject())) {
                Long projectId = task.getProject().getId();
                DashboardProjectStats stats = projectStatsMap.getOrDefault(projectId,
                    new DashboardProjectStats(projectId, task.getProject().getName(), 0L));

                projectStatsMap.put(projectId, new DashboardProjectStats(
                    projectId,
                    stats.projectName(),
                    stats.totalMinutes() + taskMinutesInPeriod
                ));
            }

            if (Objects.nonNull(task.getCategory())) {
                Category cat = task.getCategory();
                DashboardCategoryStats existing = categoryStatsMap.getOrDefault(cat.getId(),
                        new DashboardCategoryStats(cat.getId(), cat.getName(), cat.getColor(), cat.getIcon(), 0L));
                categoryStatsMap.put(cat.getId(), new DashboardCategoryStats(
                        cat.getId(), existing.categoryName(), existing.color(), existing.icon(),
                        existing.totalMinutes() + taskMinutesInPeriod));
            }
        }

        DashboardOutput output = new DashboardOutput(
            totalMinutes,
            new ArrayList<>(projectStatsMap.values()),
            new ArrayList<>(categoryStatsMap.values()),
            yesterdayTasks.stream().map(CreateTaskMapper::toCreateTaskOutput).toList(),
            finishedTasks.stream().map(CreateTaskMapper::toCreateTaskOutput).toList()
        );
        LOGGER.infof("Dashboard calculated for user %s with %d worked tasks, %d finished tasks and %d total minutes",
                input.userEmail(), workedTasks.size(), finishedTasks.size(), totalMinutes);
        return output;
    }

    private boolean isWithinPeriod(TaskHistoryItem item, LocalDateTime start, LocalDateTime end) {
        if (Objects.isNull(item.getStartAt())) return false;
        if (item.getStartAt().isAfter(end)) return false;
        if (Objects.nonNull(item.getEndAt()) && item.getEndAt().isBefore(start)) return false;
        return true;
    }

    private long calculateMinutesInRange(TaskHistoryItem item, LocalDateTime start, LocalDateTime end) {
        LocalDateTime effectiveStart = item.getStartAt().isBefore(start) ? start : item.getStartAt();
        LocalDateTime effectiveEnd = Objects.isNull(item.getEndAt()) || item.getEndAt().isAfter(end) ? end : item.getEndAt();

        if (effectiveStart.isAfter(effectiveEnd)) return 0;

        return Duration.between(effectiveStart, effectiveEnd).toMinutes();
    }
}

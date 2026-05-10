package net.beetechgroup.beetask.usecase.orgdashboard;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;

public class OrgDashboardUseCase {

    private final TaskRepository taskRepository;
    private final UserOrganizationRepository userOrganizationRepository;
    private final AuthorizeOrganizationAdminUseCase authorizer;

    public OrgDashboardUseCase(TaskRepository taskRepository,
                                UserOrganizationRepository userOrganizationRepository,
                                AuthorizeOrganizationAdminUseCase authorizer) {
        this.taskRepository = taskRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.authorizer = authorizer;
    }

    public OrgDashboardOutput execute(OrgDashboardInput input) {
        authorizer.execute(input.userEmail(), input.organizationId());

        List<UserOrganization> members = userOrganizationRepository.findByOrganizationIdAndStatus(
            input.organizationId(), UserOrganizationStatus.ACTIVE
        );

        List<String> memberEmails = members.stream()
            .map(uo -> uo.getUser().getEmail())
            .toList();

        List<Task> workedTasks = taskRepository.findTasksWorkedByUserEmailsInPeriod(
            memberEmails, input.startDate(), input.endDate()
        );
        List<Task> finishedTasks = taskRepository.findTasksFinishedByUserEmailsInPeriod(
            memberEmails, input.startDate(), input.endDate()
        );

        Map<Long, OrgProjectStats> projectStatsMap = new HashMap<>();
        Map<String, Long> memberMinutesMap = new HashMap<>();

        for (Task task : workedTasks) {
            long minutes = calculateMinutesInPeriod(task, input.startDate(), input.endDate());

            Long projectId = Objects.nonNull(task.getProject()) ? task.getProject().getId() : null;
            String projectName = Objects.nonNull(task.getProject()) ? task.getProject().getName() : "Geral";
            OrgProjectStats existing = projectStatsMap.getOrDefault(projectId,
                new OrgProjectStats(projectId, projectName, 0L));
            projectStatsMap.put(projectId, new OrgProjectStats(
                projectId, existing.projectName(), existing.totalMinutes() + minutes));

            if (Objects.nonNull(task.getUser())) {
                memberMinutesMap.merge(task.getUser().getEmail(), minutes, Long::sum);
            }
        }

        List<OrgTopTask> topTasks = workedTasks.stream()
            .map(t -> {
                long minutes = calculateMinutesInPeriod(t, input.startDate(), input.endDate());
                String projectName = Objects.nonNull(t.getProject()) ? t.getProject().getName() : "Geral";
                return new OrgTopTask(t.getId(), t.getTitle(), projectName, minutes);
            })
            .sorted(Comparator.comparingLong(OrgTopTask::totalMinutes).reversed())
            .limit(3)
            .toList();

        Map<String, Long> finishedByMember = new HashMap<>();
        for (Task task : finishedTasks) {
            if (Objects.nonNull(task.getUser())) {
                finishedByMember.merge(task.getUser().getEmail(), 1L, Long::sum);
            }
        }

        List<OrgMemberStats> memberStats = members.stream()
            .map(uo -> {
                String email = uo.getUser().getEmail();
                return new OrgMemberStats(
                    uo.getUser().getId(),
                    uo.getUser().getName(),
                    uo.getUser().getPhoto(),
                    finishedByMember.getOrDefault(email, 0L),
                    memberMinutesMap.getOrDefault(email, 0L)
                );
            })
            .sorted(Comparator.comparingLong(OrgMemberStats::totalMinutesWorked).reversed())
            .toList();

        return new OrgDashboardOutput(
            new ArrayList<>(projectStatsMap.values()),
            topTasks,
            memberStats
        );
    }

    private long calculateMinutesInPeriod(Task task, LocalDateTime start, LocalDateTime end) {
        return task.getHistory().stream()
            .filter(h -> isWithinPeriod(h, start, end))
            .mapToLong(h -> calculateMinutesInRange(h, start, end))
            .sum();
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

package net.beetechgroup.beetask.usecase.orgdashboard.memberdetail;

import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import org.jboss.logging.Logger;

public class MemberDetailUseCase {
    private static final Logger LOGGER = Logger.getLogger(MemberDetailUseCase.class);

    private final TaskRepository taskRepository;
    private final UserOrganizationRepository userOrganizationRepository;
    private final AuthorizeOrganizationAdminUseCase authorizer;

    public MemberDetailUseCase(TaskRepository taskRepository,
                                UserOrganizationRepository userOrganizationRepository,
                                AuthorizeOrganizationAdminUseCase authorizer) {
        this.taskRepository = taskRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.authorizer = authorizer;
    }

    public MemberDetailOutput execute(MemberDetailInput input) {
        LOGGER.infof("Calculating member detail for member %d in organization %d requested by %s from %s to %s",
                input.memberId(), input.organizationId(), input.userEmail(), input.startDate(), input.endDate());
        authorizer.execute(input.userEmail(), input.organizationId());

        UserOrganization member = userOrganizationRepository
                .findByUserAndOrganization(input.memberId(), input.organizationId())
                .orElseThrow(() -> {
                    LOGGER.warnf("Member detail failed because member %d was not found in organization %d",
                            input.memberId(), input.organizationId());
                    return new IllegalArgumentException("Member not found in organization");
                });

        LocalDateTime start = input.startDate();
        LocalDateTime end = input.endDate();

        long daySpan = ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate());
        boolean groupByDay = daySpan <= 30;

        List<Task> workedTasks = taskRepository.findTasksWorkedByUserIdInPeriod(input.memberId(), start, end);
        List<Task> finishedTasks = taskRepository.findTasksFinishedByUserIdInPeriod(input.memberId(), start, end);

        Map<Long, MemberDetailOutput.ProjectStats> projectStatsMap = new HashMap<>();
        Map<Long, MemberDetailOutput.CategoryStats> categoryStatsMap = new HashMap<>();
        Map<LocalDate, Long> minutesPerDay = new HashMap<>();
        Map<YearMonth, Long> minutesPerMonth = new HashMap<>();

        for (Task task : workedTasks) {
            for (TaskHistoryItem h : task.getHistory()) {
                if (!isWithinPeriod(h, start, end)) continue;
                LocalDateTime effectiveStart = h.getStartAt().isBefore(start) ? start : h.getStartAt();
                LocalDateTime effectiveEnd = (Objects.isNull(h.getEndAt()) || h.getEndAt().isAfter(end)) ? end : h.getEndAt();
                if (effectiveStart.isAfter(effectiveEnd)) continue;

                long minutes = Duration.between(effectiveStart, effectiveEnd).toMinutes();

                if (groupByDay) {
                    minutesPerDay.merge(effectiveStart.toLocalDate(), minutes, Long::sum);
                } else {
                    minutesPerMonth.merge(YearMonth.from(effectiveStart), minutes, Long::sum);
                }

                Long projectId = Objects.nonNull(task.getProject()) ? task.getProject().getId() : null;
                String projectName = Objects.nonNull(task.getProject()) ? task.getProject().getName() : "Geral";
                MemberDetailOutput.ProjectStats existing = projectStatsMap.getOrDefault(projectId,
                        new MemberDetailOutput.ProjectStats(projectId, projectName, 0L));
                projectStatsMap.put(projectId, new MemberDetailOutput.ProjectStats(
                        projectId, existing.projectName(), existing.totalMinutes() + minutes));

                if (Objects.nonNull(task.getCategory())) {
                    Category cat = task.getCategory();
                    MemberDetailOutput.CategoryStats existingCat = categoryStatsMap.getOrDefault(cat.getId(),
                            new MemberDetailOutput.CategoryStats(cat.getId(), cat.getName(), cat.getColor(), cat.getIcon(), 0L));
                    categoryStatsMap.put(cat.getId(), new MemberDetailOutput.CategoryStats(
                            cat.getId(), existingCat.categoryName(), existingCat.color(), existingCat.icon(),
                            existingCat.totalMinutes() + minutes));
                }
            }
        }

        List<MemberDetailOutput.PeriodStats> periodStats = new ArrayList<>();

        if (groupByDay) {
            Map<LocalDate, Long> finishedPerDay = new HashMap<>();
            for (Task task : finishedTasks) {
                if (Objects.isNull(task.getFinishedAt())) continue;
                finishedPerDay.merge(task.getFinishedAt().toLocalDate(), 1L, Long::sum);
            }

            LocalDate current = start.toLocalDate();
            LocalDate endDate = end.toLocalDate();
            while (!current.isAfter(endDate)) {
                periodStats.add(new MemberDetailOutput.PeriodStats(
                        current.getYear(), current.getMonthValue(), current.getDayOfMonth(),
                        finishedPerDay.getOrDefault(current, 0L),
                        minutesPerDay.getOrDefault(current, 0L)
                ));
                current = current.plusDays(1);
            }
        } else {
            Map<YearMonth, Long> finishedPerMonth = new HashMap<>();
            for (Task task : finishedTasks) {
                if (Objects.isNull(task.getFinishedAt())) continue;
                finishedPerMonth.merge(YearMonth.from(task.getFinishedAt()), 1L, Long::sum);
            }

            YearMonth current = YearMonth.from(start);
            YearMonth endMonth = YearMonth.from(end);
            while (!current.isAfter(endMonth)) {
                periodStats.add(new MemberDetailOutput.PeriodStats(
                        current.getYear(), current.getMonthValue(), null,
                        finishedPerMonth.getOrDefault(current, 0L),
                        minutesPerMonth.getOrDefault(current, 0L)
                ));
                current = current.plusMonths(1);
            }
        }

        MemberDetailOutput output = MemberDetailMapper.toOutput(member, groupByDay ? "DAY" : "MONTH", periodStats,
                new ArrayList<>(projectStatsMap.values()),
                new ArrayList<>(categoryStatsMap.values()));
        LOGGER.infof("Member detail calculated for member %d in organization %d with %d worked tasks and %d finished tasks",
                input.memberId(), input.organizationId(), workedTasks.size(), finishedTasks.size());
        return output;
    }

    private boolean isWithinPeriod(TaskHistoryItem item, LocalDateTime start, LocalDateTime end) {
        if (Objects.isNull(item.getStartAt())) return false;
        if (item.getStartAt().isAfter(end)) return false;
        if (Objects.nonNull(item.getEndAt()) && item.getEndAt().isBefore(start)) return false;
        return true;
    }
}

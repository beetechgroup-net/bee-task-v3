package net.beetechgroup.beetask.usecase.orgdashboard.memberdetail;

import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationAdminUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MemberDetailUseCase {

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
        authorizer.execute(input.userEmail(), input.organizationId());

        UserOrganization member = userOrganizationRepository
                .findByUserAndOrganization(input.memberId(), input.organizationId())
                .orElseThrow(() -> new IllegalArgumentException("Member not found in organization"));

        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusMonths(5).withDayOfMonth(1).toLocalDate().atStartOfDay();

        List<Task> workedTasks = taskRepository.findTasksWorkedByUserIdInPeriod(input.memberId(), start, end);
        List<Task> finishedTasks = taskRepository.findTasksFinishedByUserIdInPeriod(input.memberId(), start, end);

        Map<YearMonth, Long> minutesPerMonth = new HashMap<>();
        Map<YearMonth, Long> finishedPerMonth = new HashMap<>();

        for (Task task : workedTasks) {
            for (TaskHistoryItem h : task.getHistory()) {
                if (!isWithinPeriod(h, start, end)) continue;
                LocalDateTime effectiveStart = h.getStartAt().isBefore(start) ? start : h.getStartAt();
                LocalDateTime effectiveEnd = (h.getEndAt() == null || h.getEndAt().isAfter(end)) ? end : h.getEndAt();
                if (effectiveStart.isAfter(effectiveEnd)) continue;

                YearMonth ym = YearMonth.from(effectiveStart);
                long minutes = Duration.between(effectiveStart, effectiveEnd).toMinutes();
                minutesPerMonth.merge(ym, minutes, Long::sum);
            }
        }

        for (Task task : finishedTasks) {
            if (task.getFinishedAt() == null) continue;
            YearMonth ym = YearMonth.from(task.getFinishedAt());
            finishedPerMonth.merge(ym, 1L, Long::sum);
        }

        List<MemberDetailOutput.MonthlyStats> monthlyStats = new ArrayList<>();
        YearMonth current = YearMonth.from(start);
        YearMonth endMonth = YearMonth.from(end);
        while (!current.isAfter(endMonth)) {
            monthlyStats.add(new MemberDetailOutput.MonthlyStats(
                    current.getYear(),
                    current.getMonthValue(),
                    finishedPerMonth.getOrDefault(current, 0L),
                    minutesPerMonth.getOrDefault(current, 0L)
            ));
            current = current.plusMonths(1);
        }

        monthlyStats.sort(Comparator.comparingInt(MemberDetailOutput.MonthlyStats::year)
                .thenComparingInt(MemberDetailOutput.MonthlyStats::month));

        return MemberDetailMapper.toOutput(member, monthlyStats);
    }

    private boolean isWithinPeriod(TaskHistoryItem item, LocalDateTime start, LocalDateTime end) {
        if (item.getStartAt() == null) return false;
        if (item.getStartAt().isAfter(end)) return false;
        if (item.getEndAt() != null && item.getEndAt().isBefore(start)) return false;
        return true;
    }
}

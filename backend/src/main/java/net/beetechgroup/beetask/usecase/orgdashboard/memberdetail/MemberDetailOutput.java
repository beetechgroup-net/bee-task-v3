package net.beetechgroup.beetask.usecase.orgdashboard.memberdetail;

import java.util.List;

public record MemberDetailOutput(
        Long userId,
        String userName,
        String userEmail,
        String userPhoto,
        List<MonthlyStats> monthlyStats
) {
    public record MonthlyStats(int year, int month, long finishedTasksCount, long totalMinutesWorked) {}
}

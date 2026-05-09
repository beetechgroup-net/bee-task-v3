package net.beetechgroup.beetask.interfaceadapters.controllers.orgdashboard;

import java.util.List;

public record MemberDetailResponse(
        Long userId,
        String userName,
        String userEmail,
        String userPhoto,
        List<MonthlyStatsResponse> monthlyStats
) {
    public record MonthlyStatsResponse(int year, int month, long finishedTasksCount, long totalMinutesWorked) {}
}

package net.beetechgroup.beetask.interfaceadapters.controllers.orgdashboard;

import java.util.List;

public record MemberDetailResponse(
        Long userId,
        String userName,
        String userEmail,
        String userPhoto,
        String groupedBy,
        List<PeriodStatsResponse> periodStats,
        List<ProjectStatsResponse> projectStats,
        List<CategoryStatsResponse> categoryStats
) {
    public record PeriodStatsResponse(int year, int month, Integer day, long finishedTasksCount, long totalMinutesWorked) {}
    public record ProjectStatsResponse(Long projectId, String projectName, long totalMinutes) {}
    public record CategoryStatsResponse(Long categoryId, String categoryName, String color, String icon, long totalMinutes) {}
}

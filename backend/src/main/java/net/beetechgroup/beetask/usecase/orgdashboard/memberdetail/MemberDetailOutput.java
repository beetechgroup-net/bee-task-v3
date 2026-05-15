package net.beetechgroup.beetask.usecase.orgdashboard.memberdetail;

import java.util.List;

public record MemberDetailOutput(
        Long userId,
        String userName,
        String userEmail,
        String userPhoto,
        String groupedBy,
        List<PeriodStats> periodStats,
        List<ProjectStats> projectStats,
        List<CategoryStats> categoryStats
) {
    public record PeriodStats(int year, int month, Integer day, long finishedTasksCount, long totalMinutesWorked) {}
    public record ProjectStats(Long projectId, String projectName, long totalMinutes) {}
    public record CategoryStats(Long categoryId, String categoryName, String color, String icon, long totalMinutes) {}
}

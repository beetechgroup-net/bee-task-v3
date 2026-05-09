package net.beetechgroup.beetask.usecase.orgdashboard;

public record OrgMemberStats(
    Long userId,
    String userName,
    String userPhoto,
    long finishedTasksCount,
    long totalMinutesWorked
) {}

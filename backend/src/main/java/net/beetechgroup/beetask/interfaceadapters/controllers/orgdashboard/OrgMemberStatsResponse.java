package net.beetechgroup.beetask.interfaceadapters.controllers.orgdashboard;

public record OrgMemberStatsResponse(
    Long userId,
    String userName,
    String userPhoto,
    long finishedTasksCount,
    long totalMinutesWorked
) {}

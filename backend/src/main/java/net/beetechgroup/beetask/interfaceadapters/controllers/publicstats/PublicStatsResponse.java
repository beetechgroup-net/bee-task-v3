package net.beetechgroup.beetask.interfaceadapters.controllers.publicstats;

public record PublicStatsResponse(
    long totalUsers,
    long totalOrganizations,
    long totalCompletedTasks,
    double totalTrackedHours
) {}

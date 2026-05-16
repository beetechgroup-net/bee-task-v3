package net.beetechgroup.beetask.usecase.publicstats;

public record PublicStatsOutput(
    long totalUsers,
    long totalOrganizations,
    long totalCompletedTasks,
    double totalTrackedHours
) {}

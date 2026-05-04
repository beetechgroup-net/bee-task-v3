package net.beetechgroup.beetask.usecase.dashboard;

public record DashboardProjectStats(
    Long projectId,
    String projectName,
    Long totalMinutes
) {}

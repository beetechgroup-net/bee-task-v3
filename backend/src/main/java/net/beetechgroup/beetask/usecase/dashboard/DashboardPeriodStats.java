package net.beetechgroup.beetask.usecase.dashboard;

public record DashboardPeriodStats(
    int year,
    int month,
    int day,
    int finishedTasksCount,
    long totalMinutesWorked
) {}

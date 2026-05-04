package net.beetechgroup.beetask.usecase.dashboard;

import java.util.List;
import net.beetechgroup.beetask.usecase.task.create.CreateTaskOutput;

public record DashboardOutput(
    Long totalMinutesWorked,
    List<DashboardProjectStats> projectStats,
    List<CreateTaskOutput> yesterdayTasks,
    List<CreateTaskOutput> finishedTasksInPeriod
) {}

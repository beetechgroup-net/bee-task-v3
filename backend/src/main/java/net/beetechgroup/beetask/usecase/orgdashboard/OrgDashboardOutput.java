package net.beetechgroup.beetask.usecase.orgdashboard;

import java.util.List;

public record OrgDashboardOutput(
    List<OrgProjectStats> projectStats,
    List<OrgTopTask> topTasks,
    List<OrgMemberStats> memberStats
) {}

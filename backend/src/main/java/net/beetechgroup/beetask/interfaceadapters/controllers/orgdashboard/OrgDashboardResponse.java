package net.beetechgroup.beetask.interfaceadapters.controllers.orgdashboard;

import java.util.List;

public record OrgDashboardResponse(
    List<OrgProjectStatsResponse> projectStats,
    List<OrgTopTaskResponse> topTasks,
    List<OrgMemberStatsResponse> memberStats
) {}

package net.beetechgroup.beetask.interfaceadapters.controllers.orgdashboard;

import net.beetechgroup.beetask.usecase.orgdashboard.OrgDashboardOutput;

public class OrgDashboardControllerMapper {

    private OrgDashboardControllerMapper() {}

    public static OrgDashboardResponse toResponse(OrgDashboardOutput output) {
        return new OrgDashboardResponse(
            output.projectStats().stream()
                .map(p -> new OrgProjectStatsResponse(p.projectId(), p.projectName(), p.totalMinutes()))
                .toList(),
            output.categoryStats().stream()
                .map(c -> new OrgCategoryStatsResponse(c.categoryId(), c.categoryName(), c.color(), c.icon(), c.totalMinutes()))
                .toList(),
            output.topTasks().stream()
                .map(t -> new OrgTopTaskResponse(t.taskId(), t.title(), t.projectName(), t.totalMinutes()))
                .toList(),
            output.memberStats().stream()
                .map(m -> new OrgMemberStatsResponse(m.userId(), m.userName(), m.userPhoto(), m.finishedTasksCount(), m.totalMinutesWorked()))
                .toList()
        );
    }
}

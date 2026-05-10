package net.beetechgroup.beetask.interfaceadapters.controllers.orgdashboard;

import net.beetechgroup.beetask.usecase.orgdashboard.memberdetail.MemberDetailOutput;

public class MemberDetailControllerMapper {

    public static MemberDetailResponse toResponse(MemberDetailOutput output) {
        return new MemberDetailResponse(
                output.userId(),
                output.userName(),
                output.userEmail(),
                output.userPhoto(),
                output.groupedBy(),
                output.periodStats().stream()
                        .map(s -> new MemberDetailResponse.PeriodStatsResponse(
                                s.year(), s.month(), s.day(), s.finishedTasksCount(), s.totalMinutesWorked()))
                        .toList(),
                output.projectStats().stream()
                        .map(p -> new MemberDetailResponse.ProjectStatsResponse(
                                p.projectId(), p.projectName(), p.totalMinutes()))
                        .toList()
        );
    }
}

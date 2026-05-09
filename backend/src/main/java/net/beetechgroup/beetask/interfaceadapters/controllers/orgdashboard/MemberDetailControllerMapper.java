package net.beetechgroup.beetask.interfaceadapters.controllers.orgdashboard;

import net.beetechgroup.beetask.usecase.orgdashboard.memberdetail.MemberDetailOutput;

public class MemberDetailControllerMapper {

    public static MemberDetailResponse toResponse(MemberDetailOutput output) {
        return new MemberDetailResponse(
                output.userId(),
                output.userName(),
                output.userEmail(),
                output.userPhoto(),
                output.monthlyStats().stream()
                        .map(s -> new MemberDetailResponse.MonthlyStatsResponse(
                                s.year(), s.month(), s.finishedTasksCount(), s.totalMinutesWorked()))
                        .toList()
        );
    }
}

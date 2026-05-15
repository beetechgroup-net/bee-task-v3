package net.beetechgroup.beetask.usecase.orgdashboard.memberdetail;

import net.beetechgroup.beetask.entities.organization.UserOrganization;

import java.util.List;

public class MemberDetailMapper {

    public static MemberDetailOutput toOutput(UserOrganization member,
                                               String groupedBy,
                                               List<MemberDetailOutput.PeriodStats> periodStats,
                                               List<MemberDetailOutput.ProjectStats> projectStats,
                                               List<MemberDetailOutput.CategoryStats> categoryStats) {
        return new MemberDetailOutput(
                member.getUser().getId(),
                member.getUser().getName(),
                member.getUser().getEmail(),
                member.getUser().getPhoto(),
                groupedBy,
                periodStats,
                projectStats,
                categoryStats
        );
    }
}

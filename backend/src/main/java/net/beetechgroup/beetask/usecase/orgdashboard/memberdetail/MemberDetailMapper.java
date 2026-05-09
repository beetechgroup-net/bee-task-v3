package net.beetechgroup.beetask.usecase.orgdashboard.memberdetail;

import net.beetechgroup.beetask.entities.organization.UserOrganization;

import java.util.List;

public class MemberDetailMapper {

    public static MemberDetailOutput toOutput(UserOrganization member, List<MemberDetailOutput.MonthlyStats> monthlyStats) {
        return new MemberDetailOutput(
                member.getUser().getId(),
                member.getUser().getName(),
                member.getUser().getEmail(),
                member.getUser().getPhoto(),
                monthlyStats
        );
    }
}

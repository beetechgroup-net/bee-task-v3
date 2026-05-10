package net.beetechgroup.beetask.usecase.orgdashboard.memberdetail;

import java.time.LocalDateTime;

public record MemberDetailInput(String userEmail, Long organizationId, Long memberId,
                                 LocalDateTime startDate, LocalDateTime endDate) {
}

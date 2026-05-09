package net.beetechgroup.beetask.usecase.orgdashboard.memberdetail;

public record MemberDetailInput(String userEmail, Long organizationId, Long memberId) {
}

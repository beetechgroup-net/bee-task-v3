package net.beetechgroup.beetask.usecase.organization.members;

public record OrganizationMemberOutput(
        Long userId,
        String userName,
        String userEmail,
        String userPhoto) {}

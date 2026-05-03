package net.beetechgroup.beetask.usecase.organization.requests;

import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;

public record UserJoinRequestOutput(Long organizationId, String organizationName, UserOrganizationStatus status) {}

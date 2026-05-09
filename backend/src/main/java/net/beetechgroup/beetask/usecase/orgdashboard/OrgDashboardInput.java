package net.beetechgroup.beetask.usecase.orgdashboard;

import java.time.LocalDateTime;

public record OrgDashboardInput(
    String userEmail,
    Long organizationId,
    LocalDateTime startDate,
    LocalDateTime endDate
) {}

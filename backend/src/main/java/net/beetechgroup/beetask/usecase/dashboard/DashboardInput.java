package net.beetechgroup.beetask.usecase.dashboard;

import java.time.LocalDateTime;

public record DashboardInput(
    String userEmail,
    LocalDateTime startDate,
    LocalDateTime endDate
) {}

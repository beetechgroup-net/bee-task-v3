package net.beetechgroup.beetask.usecase.dashboard;

import java.time.LocalDateTime;

public record DashboardInput(
    String userEmail,
    LocalDateTime startDate,
    LocalDateTime endDate,
    Long organizationId
) {
    public DashboardInput(String userEmail, LocalDateTime startDate, LocalDateTime endDate) {
        this(userEmail, startDate, endDate, null);
    }
}

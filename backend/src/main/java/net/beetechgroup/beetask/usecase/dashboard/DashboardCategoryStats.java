package net.beetechgroup.beetask.usecase.dashboard;

public record DashboardCategoryStats(
    Long categoryId,
    String categoryName,
    String color,
    String icon,
    Long totalMinutes
) {}

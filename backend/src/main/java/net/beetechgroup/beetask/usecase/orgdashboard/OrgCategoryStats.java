package net.beetechgroup.beetask.usecase.orgdashboard;

public record OrgCategoryStats(Long categoryId, String categoryName, String color, String icon, long totalMinutes) {}

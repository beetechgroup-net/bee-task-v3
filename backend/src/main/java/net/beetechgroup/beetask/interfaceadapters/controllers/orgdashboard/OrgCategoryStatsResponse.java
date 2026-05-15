package net.beetechgroup.beetask.interfaceadapters.controllers.orgdashboard;

public record OrgCategoryStatsResponse(Long categoryId, String categoryName, String color, String icon, long totalMinutes) {}

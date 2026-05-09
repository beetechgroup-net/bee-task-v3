package net.beetechgroup.beetask.interfaceadapters.controllers.orgdashboard;

public record OrgTopTaskResponse(Long taskId, String title, String projectName, long totalMinutes) {}

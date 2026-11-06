package net.beetechgroup.beetask.interfaceadapters.controllers.task;

public record ParsedTaskResponse(
        String title,
        String description,
        Long projectId,
        Long categoryId,
        Long assigneeUserId,
        String externalUrl,
        String status
) {}

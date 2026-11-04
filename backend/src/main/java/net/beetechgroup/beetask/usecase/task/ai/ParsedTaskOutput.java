package net.beetechgroup.beetask.usecase.task.ai;

public record ParsedTaskOutput(
        String title,
        String description,
        Long projectId,
        Long categoryId,
        Long assigneeUserId,
        String status
) {}

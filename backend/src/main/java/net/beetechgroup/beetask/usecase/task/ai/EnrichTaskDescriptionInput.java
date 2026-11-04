package net.beetechgroup.beetask.usecase.task.ai;

public record EnrichTaskDescriptionInput(
        String userEmail,
        Long organizationId,
        String title,
        String currentDescription,
        Long projectId,
        Long categoryId
) {}

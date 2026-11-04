package net.beetechgroup.beetask.interfaceadapters.controllers.task;

public record EnrichTaskDescriptionRequest(
        Long organizationId,
        String title,
        String currentDescription,
        Long projectId,
        Long categoryId
) {}

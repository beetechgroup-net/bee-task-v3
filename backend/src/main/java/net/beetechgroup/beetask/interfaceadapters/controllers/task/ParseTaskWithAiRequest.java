package net.beetechgroup.beetask.interfaceadapters.controllers.task;

public record ParseTaskWithAiRequest(
        Long organizationId,
        String prompt
) {}

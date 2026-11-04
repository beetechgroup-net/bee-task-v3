package net.beetechgroup.beetask.usecase.task.ai;

public record ParseTaskWithAiInput(
        String userEmail,
        Long organizationId,
        String prompt
) {}

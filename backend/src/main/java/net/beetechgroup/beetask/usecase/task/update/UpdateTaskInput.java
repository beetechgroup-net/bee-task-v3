package net.beetechgroup.beetask.usecase.task.update;

import java.util.List;

public record UpdateTaskInput(
        Long id,
        String title,
        String description,
        String status,
        Long statusId,
        Long organizationId,
        Long projectId,
        Long categoryId,
        Long assigneeUserId,
        String userEmail,
        List<TaskHistoryItemInput> history,
        String externalUrl) {
}

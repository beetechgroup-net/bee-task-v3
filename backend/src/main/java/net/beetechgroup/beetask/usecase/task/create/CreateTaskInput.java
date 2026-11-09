package net.beetechgroup.beetask.usecase.task.create;

import java.util.List;
import net.beetechgroup.beetask.usecase.task.update.TaskHistoryItemInput;

public record CreateTaskInput(
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

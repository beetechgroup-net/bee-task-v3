package net.beetechgroup.beetask.usecase.task.update;

import java.util.List;
import net.beetechgroup.beetask.entities.task.TaskStatus;

public record UpdateTaskInput(
        Long id,
        String title,
        String description,
        TaskStatus status,
        Long organizationId,
        Long projectId,
        Long categoryId,
        Long assigneeUserId,
        String userEmail,
        List<TaskHistoryItemInput> history) {
}

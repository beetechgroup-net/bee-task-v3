package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.util.List;

import net.beetechgroup.beetask.entities.task.TaskStatus;

public record CreateTaskRequest(
                String title,
                String description,
                TaskStatus status,
                Long organizationId,
                Long projectId,
                Long categoryId,
                Long assigneeUserId,
                List<TaskHistoryItemResponse> history) {
}

package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.util.List;

public record CreateTaskRequest(
                String title,
                String description,
                String status,
                Long statusId,
                Long organizationId,
                Long projectId,
                Long categoryId,
                Long assigneeUserId,
                List<TaskHistoryItemResponse> history,
                String externalUrl) {
}

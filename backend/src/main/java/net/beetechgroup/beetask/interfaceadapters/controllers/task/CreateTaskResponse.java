package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.util.List;

import net.beetechgroup.beetask.entities.task.TaskStatus;

public record CreateTaskResponse(
                Long id,
                String title,
                String description,
                TaskStatus status,
                String project,
                List<TaskHistoryItemResponse> history) {
}
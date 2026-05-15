package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import java.time.LocalDateTime;
import java.util.List;

import net.beetechgroup.beetask.entities.task.TaskStatus;

public record CreateTaskResponse(
                Long id,
                String title,
                String description,
                TaskStatus status,
                ProjectResponse project,
                CategoryResponse category,
                LocalDateTime finishedAt,
                List<TaskHistoryItemResponse> history) {

    public record ProjectResponse(Long id, String name) {}
    public record CategoryResponse(Long id, String name, String color, String icon) {}
}

record TaskHistoryItemResponse(
                Long id,
                LocalDateTime startAt,
                LocalDateTime endAt) {
}

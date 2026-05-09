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
                LocalDateTime finishedAt,
                List<TaskHistoryItemResponse> history) {

    public record ProjectResponse(Long id, String name) {}
}

record TaskHistoryItemResponse(
                Long id,
                LocalDateTime startAt,
                LocalDateTime endAt) {
}

package net.beetechgroup.beetask.usecase.task.create;

import java.util.List;
import java.time.LocalDateTime;
import net.beetechgroup.beetask.entities.task.TaskStatus;

public record CreateTaskOutput(
                Long id,
                String title,
                String description,
                TaskStatus status,
                ProjectOutput project,
                LocalDateTime finishedAt,
                List<TaskHistoryItemOutput> history) {

    public record ProjectOutput(Long id, String name) {}
}
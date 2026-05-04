package net.beetechgroup.beetask.usecase.task.create;

import java.util.List;
import java.time.LocalDateTime;
import net.beetechgroup.beetask.entities.task.TaskStatus;

public record CreateTaskOutput(
                Long id,
                String title,
                String description,
                TaskStatus status,
                String projectName,
                LocalDateTime finishedAt,
                List<TaskHistoryItemOutput> history) {

}
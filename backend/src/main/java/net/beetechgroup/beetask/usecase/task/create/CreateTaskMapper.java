package net.beetechgroup.beetask.usecase.task.create;

import java.util.Objects;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;

public class CreateTaskMapper {
    public static CreateTaskOutput toCreateTaskOutput(Task task) {
        return new CreateTaskOutput(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                Objects.nonNull(task.getProject())
                        ? new CreateTaskOutput.ProjectOutput(task.getProject().getId(), task.getProject().getName())
                        : null,
                Objects.nonNull(task.getCategory())
                        ? new CreateTaskOutput.CategoryOutput(
                                task.getCategory().getId(),
                                task.getCategory().getName(),
                                task.getCategory().getColor(),
                                task.getCategory().getIcon())
                        : null,
                task.getFinishedAt(),
                task.getHistory().stream().map(CreateTaskMapper::toTaskHistoryItemOutput).toList());
    }

    private static TaskHistoryItemOutput toTaskHistoryItemOutput(TaskHistoryItem taskHistoryItem) {
        return new TaskHistoryItemOutput(
                taskHistoryItem.getId(),
                taskHistoryItem.getStartAt(),
                taskHistoryItem.getEndAt());
    }
}

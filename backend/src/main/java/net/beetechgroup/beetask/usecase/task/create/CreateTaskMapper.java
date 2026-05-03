package net.beetechgroup.beetask.usecase.task.create;

import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;

public class CreateTaskMapper {
    public static CreateTaskOutput toCreateTaskOutput(Task task) {
        return new CreateTaskOutput(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getProject().getName(),
                task.getHistory().stream().map(CreateTaskMapper::toTaskHistoryItemOutput).toList());
    }

    private static TaskHistoryItemOutput toTaskHistoryItemOutput(TaskHistoryItem taskHistoryItem) {
        return new TaskHistoryItemOutput(
                taskHistoryItem.getStartAt(),
                taskHistoryItem.getEndAt());
    }
}

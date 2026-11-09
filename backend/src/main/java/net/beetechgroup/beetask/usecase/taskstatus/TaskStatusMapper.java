package net.beetechgroup.beetask.usecase.taskstatus;

import net.beetechgroup.beetask.entities.task.TaskStatus;

public class TaskStatusMapper {
    public static TaskStatusOutput toOutput(TaskStatus status, long taskCount) {
        if (status == null) return null;
        return new TaskStatusOutput(
                status.getId(),
                status.getName(),
                status.getColor(),
                status.getPosition(),
                status.isDefault(),
                status.isCompleted(),
                status.isCanceled(),
                status.getOrganization() != null ? status.getOrganization().getId() : null,
                taskCount
        );
    }
}

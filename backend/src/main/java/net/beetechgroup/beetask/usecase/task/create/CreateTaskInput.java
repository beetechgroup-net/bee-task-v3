package net.beetechgroup.beetask.usecase.task.create;

import net.beetechgroup.beetask.entities.task.TaskStatus;

public record CreateTaskInput(
        String title,
        String description,
        TaskStatus status,
        Long projectId) {
}

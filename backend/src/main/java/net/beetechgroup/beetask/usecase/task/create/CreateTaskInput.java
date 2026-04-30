package net.beetechgroup.beetask.usecase.task.create;

import net.beetechgroup.beetask.entities.TaskStatus;

public record CreateTaskInput(
        String title,
        String description,
        TaskStatus status,
        String project) {
}

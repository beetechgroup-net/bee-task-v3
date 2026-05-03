package net.beetechgroup.beetask.interfaceadapters.controllers.task;

import net.beetechgroup.beetask.entities.task.TaskStatus;

public record CreateTaskRequest(
                String title,
                String description,
                TaskStatus status,
                Long projectId) {
}

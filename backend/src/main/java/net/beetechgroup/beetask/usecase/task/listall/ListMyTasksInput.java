package net.beetechgroup.beetask.usecase.task.listall;

import net.beetechgroup.beetask.entities.task.TaskStatus;

public record ListMyTasksInput(String email, String text, Long projectId, TaskStatus status) {}

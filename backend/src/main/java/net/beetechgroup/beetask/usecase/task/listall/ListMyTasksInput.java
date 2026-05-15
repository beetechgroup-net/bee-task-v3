package net.beetechgroup.beetask.usecase.task.listall;

import java.util.List;

import net.beetechgroup.beetask.entities.task.TaskStatus;

public record ListMyTasksInput(String email, String text, Long projectId,
                                List<TaskStatus> statuses, List<Long> categoryIds) {}

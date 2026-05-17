package net.beetechgroup.beetask.usecase.task.listall;

import java.util.List;

import net.beetechgroup.beetask.entities.task.TaskStatus;

public record ListMyTasksInput(String email, String text, List<Long> projectIds,
                                List<TaskStatus> statuses, List<Long> categoryIds) {}

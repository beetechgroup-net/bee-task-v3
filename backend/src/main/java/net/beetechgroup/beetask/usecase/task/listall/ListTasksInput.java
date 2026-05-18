package net.beetechgroup.beetask.usecase.task.listall;

import java.util.List;

import net.beetechgroup.beetask.entities.task.TaskStatus;

public record ListTasksInput(
        String userEmail,
        Long organizationId,
        String text,
        List<Long> projectIds,
        List<TaskStatus> statuses,
        List<Long> categoryIds,
        List<Long> userIds) {}

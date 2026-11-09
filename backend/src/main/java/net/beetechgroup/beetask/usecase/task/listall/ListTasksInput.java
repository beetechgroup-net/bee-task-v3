package net.beetechgroup.beetask.usecase.task.listall;

import java.util.List;

public record ListTasksInput(
        String userEmail,
        Long organizationId,
        String text,
        List<Long> projectIds,
        List<String> statuses,
        List<Long> categoryIds,
        List<Long> userIds) {}

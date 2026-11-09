package net.beetechgroup.beetask.usecase.task.listall;

import java.util.List;

public record ListMyTasksInput(String email, String text, List<Long> projectIds,
                                List<String> statuses, List<Long> categoryIds) {}

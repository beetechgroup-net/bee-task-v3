package net.beetechgroup.beetask.interfaceadapters.controllers.taskstatus;

public record TaskStatusResponse(
        Long id,
        String name,
        String color,
        Integer position,
        boolean isDefault,
        boolean isCompleted,
        boolean isCanceled,
        Long organizationId,
        long taskCount) {
}

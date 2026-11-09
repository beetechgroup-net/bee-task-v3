package net.beetechgroup.beetask.usecase.taskstatus;

public record TaskStatusOutput(
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

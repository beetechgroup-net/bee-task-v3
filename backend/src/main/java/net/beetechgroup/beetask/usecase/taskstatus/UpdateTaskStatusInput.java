package net.beetechgroup.beetask.usecase.taskstatus;

public record UpdateTaskStatusInput(
        String userEmail,
        Long organizationId,
        Long id,
        String name,
        String color,
        Integer position,
        Boolean isDefault,
        Boolean isCompleted,
        Boolean isCanceled) {
}

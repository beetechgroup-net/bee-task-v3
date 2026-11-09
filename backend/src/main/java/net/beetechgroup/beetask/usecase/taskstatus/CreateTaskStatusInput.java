package net.beetechgroup.beetask.usecase.taskstatus;

public record CreateTaskStatusInput(
        String userEmail,
        Long organizationId,
        String name,
        String color,
        Integer position,
        Boolean isDefault,
        Boolean isCompleted,
        Boolean isCanceled) {
}

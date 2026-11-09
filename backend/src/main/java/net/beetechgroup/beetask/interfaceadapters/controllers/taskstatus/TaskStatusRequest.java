package net.beetechgroup.beetask.interfaceadapters.controllers.taskstatus;

public record TaskStatusRequest(
        String name,
        String color,
        Integer position,
        Boolean isDefault,
        Boolean isCompleted,
        Boolean isCanceled) {
}

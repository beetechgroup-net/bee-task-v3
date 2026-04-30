package net.beetechgroup.beetask.usecase.exceptions;

public class TaskNotFoundException extends RuntimeException {
    public TaskNotFoundException(String message) {
        super(message);
    }
}

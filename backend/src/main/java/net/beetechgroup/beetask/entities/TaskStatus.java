package net.beetechgroup.beetask.entities;

public enum TaskStatus {
    NOT_STARTED("NOT_STARTED"),
    IN_PROGRESS("IN_PROGRESS"),
    COMPLETED("COMPLETED"),
    CANCELED("CANCELED");

    private String status;

    TaskStatus(String status) {
        this.status = status;
    }

    public String getStatus() {
        return status;
    }
}

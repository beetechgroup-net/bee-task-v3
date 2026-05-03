package net.beetechgroup.beetask.entities.task;

import java.time.LocalDateTime;

public class TaskHistoryItem {
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    public void setEndAt(LocalDateTime endAt) {
        this.endAt = endAt;
    }

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }

    public boolean isRunning() {
        return endAt == null;
    }
}

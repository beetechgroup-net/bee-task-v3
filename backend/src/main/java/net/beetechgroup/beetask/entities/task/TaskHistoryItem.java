package net.beetechgroup.beetask.entities.task;

import java.time.LocalDateTime;

public class TaskHistoryItem {
    private Long id;
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

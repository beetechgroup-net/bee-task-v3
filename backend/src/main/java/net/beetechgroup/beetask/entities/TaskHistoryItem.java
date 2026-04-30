package net.beetechgroup.beetask.entities;

import java.time.Duration;
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

    public Duration getDuration() {
        if (endAt == null) {
            return Duration.between(startAt, LocalDateTime.now());
        }
        return Duration.between(startAt, endAt);
    }

    public boolean isRunning() {
        return endAt == null;
    }
}

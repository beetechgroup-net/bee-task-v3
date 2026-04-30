package net.beetechgroup.beetask.frameworks.persistence.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Embeddable;

@Embeddable
public class TaskHistoryItemEntity {
    private LocalDateTime startAt;
    private LocalDateTime endAt;

    public LocalDateTime getStartAt() {
        return startAt;
    }

    public void setStartAt(LocalDateTime startAt) {
        this.startAt = startAt;
    }

    public LocalDateTime getEndAt() {
        return endAt;
    }

    public void setEndAt(LocalDateTime endAt) {
        this.endAt = endAt;
    }
}

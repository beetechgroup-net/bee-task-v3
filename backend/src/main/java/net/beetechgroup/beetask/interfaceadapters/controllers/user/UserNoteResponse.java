package net.beetechgroup.beetask.interfaceadapters.controllers.user;

import net.beetechgroup.beetask.entities.UserNote;
import java.time.LocalDateTime;

public class UserNoteResponse {
    private Long id;
    private Long userId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserNoteResponse() {
    }

    public UserNoteResponse(Long id, Long userId, String content, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.content = content;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static UserNoteResponse from(UserNote note) {
        if (note == null) return null;
        return new UserNoteResponse(
                note.getId(),
                note.getUserId(),
                note.getContent() != null ? note.getContent() : "",
                note.getCreatedAt(),
                note.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

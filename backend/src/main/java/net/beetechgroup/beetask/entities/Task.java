package net.beetechgroup.beetask.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class Task {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private String project;
    private List<TaskHistoryItem> history = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public String getProject() {
        return project;
    }

    public void setProject(String project) {
        this.project = project;
    }

    public List<TaskHistoryItem> getHistory() {
        return history;
    }

    public void setHistory(List<TaskHistoryItem> history) {
        this.history = history;
    }

    public boolean isRunning() {
        return history.stream().anyMatch(TaskHistoryItem::isRunning);
    }

    private TaskHistoryItem getCurrentRunningItem() {
        return history.stream()
            .filter(TaskHistoryItem::isRunning)
        .findFirst()
        .orElse(null);
}

    public void start() {
    TaskHistoryItem current = getCurrentRunningItem();
    
    if (current != null) {
        throw new IllegalStateException("Tarefa já está em execução");
    }

    this.status = TaskStatus.IN_PROGRESS;
    TaskHistoryItem item = new TaskHistoryItem();
    item.setStartAt(LocalDateTime.now());
    this.history.add(item);
    }

    public void stop() {
    TaskHistoryItem current = getCurrentRunningItem();

    if (current == null) {
        throw new IllegalStateException("Task não está em execução");
    }

    current.setEndAt(LocalDateTime.now());
}


}

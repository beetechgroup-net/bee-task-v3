package net.beetechgroup.beetask.entities.task;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.Organization;

public class Task {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private Organization organization;
    private Project project;
    private Category category;
    private User user;
    private User createdBy;
    private LocalDateTime finishedAt;
    private List<TaskHistoryItem> history = new ArrayList<>();
    private String externalUrl;

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public String getExternalUrl() {
        return externalUrl;
    }

    public void setExternalUrl(String externalUrl) {
        this.externalUrl = externalUrl;
    }

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
        if (this.status == status) return;

        if (status == TaskStatus.COMPLETED || status == TaskStatus.CANCELED) {
            if (isRunning()) {
                this.stop();
            }
            if (status == TaskStatus.COMPLETED) {
                this.finishedAt = LocalDateTime.now();
            } else {
                this.finishedAt = null;
            }
        } else {
            this.finishedAt = null;
        }

        this.status = status;
    }

    public LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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
        start(this.user);
    }

    public void start(User worker) {
        TaskHistoryItem current = getCurrentRunningItem();

        if (Objects.nonNull(current)) {
            throw new IllegalStateException("Tarefa já está em execução");
        }

        this.status = TaskStatus.IN_PROGRESS;
        TaskHistoryItem item = new TaskHistoryItem();
        item.setStartAt(LocalDateTime.now());
        item.setUser(worker != null ? worker : this.user);
        this.history.add(item);
    }

    public void stop() {
        TaskHistoryItem current = getCurrentRunningItem();

        if (Objects.isNull(current)) {
            throw new IllegalStateException("Task não está em execução");
        }

        current.setEndAt(LocalDateTime.now());
    }
}

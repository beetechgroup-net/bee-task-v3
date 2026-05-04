package net.beetechgroup.beetask.frameworks.persistence.entities;

import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import net.beetechgroup.beetask.entities.task.TaskStatus;

@Entity
@Table(name = "tasks")
public class TaskEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private java.time.LocalDateTime finishedAt;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private ProjectEntity project;
    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TaskHistoryItemEntity> history;

    public void setHistory(List<TaskHistoryItemEntity> history) {
        this.history = history;
    }

    public List<TaskHistoryItemEntity> getHistory() {
        return history;
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
        this.status = status;
    }

    public java.time.LocalDateTime getFinishedAt() {
        return finishedAt;
    }

    public void setFinishedAt(java.time.LocalDateTime finishedAt) {
        this.finishedAt = finishedAt;
    }

    public ProjectEntity getProject() {
        return project;
    }

    public void setProject(ProjectEntity project) {
        this.project = project;
    }

}

package net.beetechgroup.beetask.entities.task;

import java.util.Objects;
import net.beetechgroup.beetask.entities.organization.Organization;

public class TaskStatus {
    private Long id;
    private String name;
    private String color;
    private Integer position;
    private boolean isDefault;
    private boolean isCompleted;
    private boolean isCanceled;
    private Organization organization;

    public TaskStatus() {
    }

    public TaskStatus(Long id, String name, String color, Integer position, boolean isDefault, boolean isCompleted, boolean isCanceled, Organization organization) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.position = position;
        this.isDefault = isDefault;
        this.isCompleted = isCompleted;
        this.isCanceled = isCanceled;
        this.organization = organization;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public Integer getPosition() {
        return position != null ? position : 0;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean isDefault) {
        this.isDefault = isDefault;
    }

    public boolean isCompleted() {
        return isCompleted;
    }

    public void setCompleted(boolean isCompleted) {
        this.isCompleted = isCompleted;
    }

    public boolean isCanceled() {
        return isCanceled;
    }

    public void setCanceled(boolean isCanceled) {
        this.isCanceled = isCanceled;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TaskStatus that = (TaskStatus) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}

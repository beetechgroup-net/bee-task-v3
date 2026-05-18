package net.beetechgroup.beetask.entities;

import java.util.List;
import java.util.Objects;

import net.beetechgroup.beetask.entities.organization.Organization;

public class Project {
    private Long id;
    private String name;
    private String color;
    private String icon;
    private Organization organization;
    private List<User> users;

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

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    @Override
    public String toString() {
        return "Project{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", organization=" + (Objects.nonNull(organization) ? organization.getName() : "null") +
                '}';
    }
}

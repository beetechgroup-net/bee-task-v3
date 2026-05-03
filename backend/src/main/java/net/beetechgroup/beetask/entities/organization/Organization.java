package net.beetechgroup.beetask.entities.organization;

import java.util.List;

import net.beetechgroup.beetask.entities.Project;

public class Organization {
    private Long id;
    private String name;
    private List<Project> projects;
    private List<UserOrganization> users;

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

    public List<Project> getProjects() {
        return projects;
    }

    public void setProjects(List<Project> projects) {
        this.projects = projects;
    }

    public List<UserOrganization> getUsers() {
        return users;
    }

    public void setUsers(List<UserOrganization> users) {
        this.users = users;
    }
}
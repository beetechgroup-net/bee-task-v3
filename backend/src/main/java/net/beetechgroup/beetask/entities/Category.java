package net.beetechgroup.beetask.entities;

import java.util.Objects;

import net.beetechgroup.beetask.entities.organization.Organization;

public class Category {
    private Long id;
    private String name;
    private String color;
    private String icon;
    private Organization organization;

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

    @Override
    public String toString() {
        return "Category{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", organization=" + (Objects.nonNull(organization) ? organization.getName() : "null") +
                '}';
    }
}

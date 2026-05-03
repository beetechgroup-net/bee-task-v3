package net.beetechgroup.beetask.entities.organization;

import net.beetechgroup.beetask.entities.User;

public class UserOrganization {
    private User user;
    private Organization organization;
    private UserOrganizationRole role;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Organization getOrganization() {
        return organization;
    }

    public void setOrganization(Organization organization) {
        this.organization = organization;
    }

    public UserOrganizationRole getRole() {
        return role;
    }

    public void setRole(UserOrganizationRole role) {
        this.role = role;
    }
}

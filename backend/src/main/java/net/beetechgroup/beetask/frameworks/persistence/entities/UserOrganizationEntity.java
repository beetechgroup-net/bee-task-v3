package net.beetechgroup.beetask.frameworks.persistence.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import net.beetechgroup.beetask.entities.organization.UserOrganizationRole;

@Entity
@Table(name = "user_organizations")
public class UserOrganizationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;
    @ManyToOne
    @JoinColumn(name = "organization_id")
    private OrganizationEntity organization;
    private UserOrganizationRole role;

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public OrganizationEntity getOrganization() {
        return organization;
    }

    public void setOrganization(OrganizationEntity organization) {
        this.organization = organization;
    }

    public UserOrganizationRole getRole() {
        return role;
    }

    public void setRole(UserOrganizationRole role) {
        this.role = role;
    }
}

package net.beetechgroup.beetask.frameworks.persistence.entities;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "organizations")
public class OrganizationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @OneToMany(mappedBy = "organization")
    private List<UserOrganizationEntity> userOrganizations;

    public void setUserOrganizations(List<UserOrganizationEntity> userOrganizations) {
        this.userOrganizations = userOrganizations;
    }

    public List<UserOrganizationEntity> getUserOrganizations() {
        return userOrganizations;
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

}

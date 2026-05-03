package net.beetechgroup.beetask.frameworks.persistence.mapper;

import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.frameworks.persistence.entities.OrganizationEntity;

public class OrganizationEntityMapper {
    public static OrganizationEntity toEntity(Organization organization) {
        OrganizationEntity entity = new OrganizationEntity();
        entity.setId(organization.getId());
        entity.setName(organization.getName());
        return entity;
    }

    public static Organization toDomain(OrganizationEntity entity) {
        if (entity == null) return null;

        Organization organization = new Organization();
        organization.setId(entity.getId());
        organization.setName(entity.getName());
        return organization;
    }
}

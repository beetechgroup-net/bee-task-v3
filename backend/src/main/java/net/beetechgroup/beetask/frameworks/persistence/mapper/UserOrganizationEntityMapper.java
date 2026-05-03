package net.beetechgroup.beetask.frameworks.persistence.mapper;

import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserOrganizationEntity;

public class UserOrganizationEntityMapper {

    public static UserOrganization toDomain(UserOrganizationEntity entity) {
        if (entity == null) return null;
        UserOrganization domain = new UserOrganization();
        domain.setUser(UserEntityMapper.toDomain(entity.getUser()));
        domain.setOrganization(OrganizationEntityMapper.toDomain(entity.getOrganization()));
        domain.setRole(entity.getRole());
        return domain;
    }
}

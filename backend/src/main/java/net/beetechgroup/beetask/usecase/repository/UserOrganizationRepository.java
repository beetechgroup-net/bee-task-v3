package net.beetechgroup.beetask.usecase.repository;

import net.beetechgroup.beetask.entities.organization.UserOrganization;
import java.util.List;

public interface UserOrganizationRepository {
    List<UserOrganization> findByUserId(Long userId);
    void save(UserOrganization userOrganization);
}

package net.beetechgroup.beetask.usecase.repository;

import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import java.util.List;
import java.util.Optional;

public interface UserOrganizationRepository {
    List<UserOrganization> findByUserId(Long userId);
    List<UserOrganization> findByUserIdAndStatus(Long userId, UserOrganizationStatus status);
    List<UserOrganization> findByOrganizationIdAndStatus(Long organizationId, UserOrganizationStatus status);
    Optional<UserOrganization> findByUserAndOrganization(Long userId, Long organizationId);
    void save(UserOrganization userOrganization);
}

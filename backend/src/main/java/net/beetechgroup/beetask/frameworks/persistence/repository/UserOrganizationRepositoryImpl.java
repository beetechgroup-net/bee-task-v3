package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserOrganizationEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.UserOrganizationEntityMapper;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class UserOrganizationRepositoryImpl implements UserOrganizationRepository, PanacheRepository<UserOrganizationEntity> {

    @Override
    public List<UserOrganization> findByUserId(Long userId) {
        return find("user.id", userId).stream()
                .map(UserOrganizationEntityMapper::toDomain)
                .toList();
    }

    @Override
    public List<UserOrganization> findByUserIdAndStatus(Long userId, UserOrganizationStatus status) {
        return find("user.id = ?1 and status = ?2", userId, status).stream()
                .map(UserOrganizationEntityMapper::toDomain)
                .toList();
    }

    @Override
    public List<UserOrganization> findByOrganizationIdAndStatus(Long organizationId, UserOrganizationStatus status) {
        return find("organization.id = ?1 and status = ?2", organizationId, status).stream()
                .map(UserOrganizationEntityMapper::toDomain)
                .toList();
    }

    @Override
    public Optional<UserOrganization> findByUserAndOrganization(Long userId, Long organizationId) {
        return find("user.id = ?1 and organization.id = ?2", userId, organizationId)
                .firstResultOptional()
                .map(UserOrganizationEntityMapper::toDomain);
    }

    @Override
    @Transactional
    public void save(UserOrganization userOrganization) {
        UserOrganizationEntity entity = UserOrganizationEntityMapper.toEntity(userOrganization);
        if (entity.getUser().getId() != null && entity.getOrganization().getId() != null) {
            // Find existing by user and org to update instead of creating new if it exists
            Optional<UserOrganizationEntity> existing = find("user.id = ?1 and organization.id = ?2", 
                entity.getUser().getId(), entity.getOrganization().getId()).firstResultOptional();
            if (existing.isPresent()) {
                UserOrganizationEntity existingEntity = existing.get();
                existingEntity.setRole(entity.getRole());
                existingEntity.setStatus(entity.getStatus());
                getEntityManager().merge(existingEntity);
                return;
            }
        }
        persist(entity);
    }
}

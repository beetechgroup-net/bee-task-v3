package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserOrganizationEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.UserOrganizationEntityMapper;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@ApplicationScoped
public class UserOrganizationRepositoryImpl implements UserOrganizationRepository, PanacheRepository<UserOrganizationEntity> {
    private static final Logger LOGGER = Logger.getLogger(UserOrganizationRepositoryImpl.class);

    @Override
    public List<UserOrganization> findByUserId(Long userId) {
        List<UserOrganization> organizations = find("user.id", userId).stream()
                .map(UserOrganizationEntityMapper::toDomain)
                .toList();
        LOGGER.infof("Loaded %d organization memberships for user %d", organizations.size(), userId);
        return organizations;
    }

    @Override
    public List<UserOrganization> findByUserIdAndStatus(Long userId, UserOrganizationStatus status) {
        List<UserOrganization> organizations = find("user.id = ?1 and status = ?2", userId, status).stream()
                .map(UserOrganizationEntityMapper::toDomain)
                .toList();
        LOGGER.infof("Loaded %d organization memberships for user %d with status %s", organizations.size(), userId, status);
        return organizations;
    }

    @Override
    public List<UserOrganization> findByOrganizationIdAndStatus(Long organizationId, UserOrganizationStatus status) {
        List<UserOrganization> organizations = find("organization.id = ?1 and status = ?2", organizationId, status).stream()
                .map(UserOrganizationEntityMapper::toDomain)
                .toList();
        LOGGER.infof("Loaded %d memberships for organization %d with status %s", organizations.size(), organizationId, status);
        return organizations;
    }

    @Override
    public Optional<UserOrganization> findByUserAndOrganization(Long userId, Long organizationId) {
        Optional<UserOrganization> association = find("user.id = ?1 and organization.id = ?2", userId, organizationId)
                .firstResultOptional()
                .map(UserOrganizationEntityMapper::toDomain);
        if (association.isEmpty()) {
            LOGGER.warnf("Membership for user %d and organization %d was not found", userId, organizationId);
        }
        return association;
    }

    @Override
    @Transactional
    public void save(UserOrganization userOrganization) {
        UserOrganizationEntity entity = UserOrganizationEntityMapper.toEntity(userOrganization);
        if (Objects.nonNull(entity.getUser().getId()) && Objects.nonNull(entity.getOrganization().getId())) {
            Optional<UserOrganizationEntity> existing = find("user.id = ?1 and organization.id = ?2",
                entity.getUser().getId(), entity.getOrganization().getId()).firstResultOptional();
            if (existing.isPresent()) {
                UserOrganizationEntity existingEntity = existing.get();
                existingEntity.setRole(entity.getRole());
                existingEntity.setStatus(entity.getStatus());
                getEntityManager().merge(existingEntity);
                LOGGER.infof("Updated membership for user %d in organization %d to role %s and status %s",
                        entity.getUser().getId(), entity.getOrganization().getId(), entity.getRole(), entity.getStatus());
                return;
            }
        }
        persist(entity);
        LOGGER.infof("Created membership for user %d in organization %d with role %s and status %s",
                entity.getUser().getId(), entity.getOrganization().getId(), entity.getRole(), entity.getStatus());
    }
}

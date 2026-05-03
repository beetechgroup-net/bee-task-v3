package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserOrganizationEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.UserOrganizationEntityMapper;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;

import java.util.List;

@ApplicationScoped
public class UserOrganizationRepositoryImpl implements UserOrganizationRepository, PanacheRepository<UserOrganizationEntity> {

    @Override
    public List<UserOrganization> findByUserId(Long userId) {
        return find("user.id", userId).stream()
                .map(UserOrganizationEntityMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public void save(UserOrganization userOrganization) {
        UserOrganizationEntity entity = UserOrganizationEntityMapper.toEntity(userOrganization);
        persist(entity);
    }
}

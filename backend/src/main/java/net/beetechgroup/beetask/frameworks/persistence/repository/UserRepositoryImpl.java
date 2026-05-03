package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.UserEntityMapper;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class UserRepositoryImpl implements UserRepository, PanacheRepository<UserEntity> {

    @Inject
    UserOrganizationRepository userOrganizationRepository;

    @Override
    @Transactional
    public User save(User user) {
        UserEntity entity = UserEntityMapper.toEntity(user);
        if (entity.getId() == null) {
            persist(entity);
        } else {
            entity = getEntityManager().merge(entity);
        }
        return UserEntityMapper.toDomain(entity);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return find("email", email).firstResultOptional()
                .map(UserEntityMapper::toDomain);
    }

    @Override
    public Optional<User> findUserById(Long id) {
        return findByIdOptional(id)
                .map(UserEntityMapper::toDomain);
    }

    @Override
    public List<UserOrganization> findUserOrganizations(Long userId) {
        return userOrganizationRepository.findByUserId(userId);
    }
}

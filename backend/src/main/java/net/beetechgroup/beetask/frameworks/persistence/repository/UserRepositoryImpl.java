package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Objects;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.UserEntityMapper;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class UserRepositoryImpl implements UserRepository, PanacheRepository<UserEntity> {
    private static final Logger LOGGER = Logger.getLogger(UserRepositoryImpl.class);

    @Inject
    UserOrganizationRepository userOrganizationRepository;

    @Override
    @Transactional
    public User save(User user) {
        UserEntity entity = UserEntityMapper.toEntity(user);
        if (Objects.isNull(entity.getId())) {
            persist(entity);
        } else {
            entity = getEntityManager().merge(entity);
        }
        User savedUser = UserEntityMapper.toDomain(entity);
        LOGGER.infof("Persisted user %d with email %s", savedUser.getId(), savedUser.getEmail());
        return savedUser;
    }

    @Override
    public Optional<User> findByEmail(String email) {
        Optional<User> user = find("email", email).firstResultOptional()
                .map(UserEntityMapper::toDomain);
        if (user.isEmpty()) {
            LOGGER.warnf("User with email %s was not found", email);
        }
        return user;
    }

    @Override
    public Optional<User> findUserById(Long id) {
        Optional<User> user = findByIdOptional(id)
                .map(UserEntityMapper::toDomain);
        if (user.isEmpty()) {
            LOGGER.warnf("User with id %d was not found", id);
        }
        return user;
    }

    @Override
    public List<UserOrganization> findUserOrganizations(Long userId) {
        List<UserOrganization> organizations = userOrganizationRepository.findByUserIdAndStatus(userId, UserOrganizationStatus.ACTIVE);
        LOGGER.infof("Loaded %d active organizations for user %d", organizations.size(), userId);
        return organizations;
    }
}

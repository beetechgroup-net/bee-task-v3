package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.UserSignature;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserEntity;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserSignatureEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.UserSignatureEntityMapper;
import net.beetechgroup.beetask.usecase.repository.UserSignatureRepository;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class UserSignatureRepositoryImpl implements UserSignatureRepository, PanacheRepository<UserSignatureEntity> {

    @Inject
    EntityManager em;

    @Override
    @Transactional
    public List<UserSignature> findByUserId(Long userId) {
        return find("user.id = ?1 order by isDefault desc, createdAt desc", userId)
                .list()
                .stream()
                .map(UserSignatureEntityMapper::toDomain)
                .toList();
    }

    @Override
    @Transactional
    public Optional<UserSignature> findSignatureById(Long id) {
        return findByIdOptional(id).map(UserSignatureEntityMapper::toDomain);
    }

    @Override
    @Transactional
    public UserSignature save(UserSignature signature) {
        UserEntity userEntity = em.getReference(UserEntity.class, signature.getUserId());
        UserSignatureEntity entity = UserSignatureEntityMapper.toEntity(signature, userEntity);

        if (entity.getId() == null) {
            persist(entity);
        } else {
            UserSignatureEntity existing = findById(entity.getId());
            if (existing != null) {
                existing.setName(entity.getName());
                existing.setSignatureType(entity.getSignatureType());
                existing.setImageUrl(entity.getImageUrl());
                existing.setStorageKey(entity.getStorageKey());
                existing.setDefault(entity.isDefault());
                existing.setUpdatedAt(java.time.LocalDateTime.now());
                entity = existing;
            } else {
                entity = em.merge(entity);
            }
        }
        return UserSignatureEntityMapper.toDomain(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        deleteById(id);
    }

    @Override
    @Transactional
    public void unsetDefaultForUser(Long userId) {
        update("isDefault = false where user.id = ?1", userId);
    }
}

package net.beetechgroup.beetask.frameworks.persistence.mapper;

import net.beetechgroup.beetask.entities.UserSignature;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserEntity;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserSignatureEntity;

public class UserSignatureEntityMapper {

    public static UserSignature toDomain(UserSignatureEntity entity) {
        if (entity == null) return null;
        return new UserSignature(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getName(),
                entity.getSignatureType(),
                entity.getImageUrl(),
                entity.getStorageKey(),
                entity.isDefault(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static UserSignatureEntity toEntity(UserSignature domain, UserEntity userEntity) {
        if (domain == null) return null;
        UserSignatureEntity entity = new UserSignatureEntity();
        entity.setId(domain.getId());
        entity.setUser(userEntity);
        entity.setName(domain.getName());
        entity.setSignatureType(domain.getSignatureType());
        entity.setImageUrl(domain.getImageUrl());
        entity.setStorageKey(domain.getStorageKey());
        entity.setDefault(domain.isDefault());
        if (domain.getCreatedAt() != null) {
            entity.setCreatedAt(domain.getCreatedAt());
        }
        if (domain.getUpdatedAt() != null) {
            entity.setUpdatedAt(domain.getUpdatedAt());
        }
        return entity;
    }
}

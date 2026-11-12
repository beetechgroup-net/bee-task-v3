package net.beetechgroup.beetask.frameworks.persistence.mapper;

import net.beetechgroup.beetask.entities.UserNote;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserEntity;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserNoteEntity;

public class UserNoteEntityMapper {

    public static UserNote toDomain(UserNoteEntity entity) {
        if (entity == null) return null;
        return new UserNote(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getContent(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public static UserNoteEntity toEntity(UserNote domain, UserEntity userEntity) {
        if (domain == null) return null;
        UserNoteEntity entity = new UserNoteEntity();
        entity.setId(domain.getId());
        entity.setUser(userEntity);
        entity.setContent(domain.getContent() != null ? domain.getContent() : "");
        if (domain.getCreatedAt() != null) {
            entity.setCreatedAt(domain.getCreatedAt());
        }
        if (domain.getUpdatedAt() != null) {
            entity.setUpdatedAt(domain.getUpdatedAt());
        }
        return entity;
    }
}

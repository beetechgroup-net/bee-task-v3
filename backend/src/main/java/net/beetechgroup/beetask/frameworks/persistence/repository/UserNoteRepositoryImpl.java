package net.beetechgroup.beetask.frameworks.persistence.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.entities.UserNote;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserEntity;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserNoteEntity;
import net.beetechgroup.beetask.frameworks.persistence.mapper.UserNoteEntityMapper;
import net.beetechgroup.beetask.usecase.repository.UserNoteRepository;

import java.time.LocalDateTime;
import java.util.Optional;

@ApplicationScoped
public class UserNoteRepositoryImpl implements UserNoteRepository, PanacheRepository<UserNoteEntity> {

    @Inject
    EntityManager em;

    @Override
    @Transactional
    public Optional<UserNote> findByUserId(Long userId) {
        return find("user.id = ?1", userId)
                .firstResultOptional()
                .map(UserNoteEntityMapper::toDomain);
    }

    @Override
    @Transactional
    public UserNote save(UserNote note) {
        UserEntity userEntity = em.getReference(UserEntity.class, note.getUserId());
        Optional<UserNoteEntity> existingOpt = find("user.id = ?1", note.getUserId()).firstResultOptional();

        UserNoteEntity entity;
        if (existingOpt.isPresent()) {
            entity = existingOpt.get();
            entity.setContent(note.getContent() != null ? note.getContent() : "");
            entity.setUpdatedAt(LocalDateTime.now());
        } else {
            entity = UserNoteEntityMapper.toEntity(note, userEntity);
            if (entity.getCreatedAt() == null) {
                entity.setCreatedAt(LocalDateTime.now());
            }
            entity.setUpdatedAt(LocalDateTime.now());
            persist(entity);
        }

        return UserNoteEntityMapper.toDomain(entity);
    }
}

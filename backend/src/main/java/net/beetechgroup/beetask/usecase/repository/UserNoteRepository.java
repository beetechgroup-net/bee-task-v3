package net.beetechgroup.beetask.usecase.repository;

import net.beetechgroup.beetask.entities.UserNote;
import java.util.Optional;

public interface UserNoteRepository {
    Optional<UserNote> findByUserId(Long userId);
    UserNote save(UserNote note);
}

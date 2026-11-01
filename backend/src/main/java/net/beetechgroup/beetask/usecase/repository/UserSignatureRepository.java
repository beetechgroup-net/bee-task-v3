package net.beetechgroup.beetask.usecase.repository;

import net.beetechgroup.beetask.entities.UserSignature;
import java.util.List;
import java.util.Optional;

public interface UserSignatureRepository {
    List<UserSignature> findByUserId(Long userId);
    Optional<UserSignature> findSignatureById(Long id);
    UserSignature save(UserSignature signature);
    void delete(Long id);
    void unsetDefaultForUser(Long userId);
}

package net.beetechgroup.beetask.usecase.repository;

import net.beetechgroup.beetask.entities.User;
import java.util.List;
import java.util.Optional;
import net.beetechgroup.beetask.entities.organization.UserOrganization;

public interface UserRepository {
    User save(User user);
    Optional<User> findByEmail(String email);
    Optional<User> findUserById(Long id);
    List<UserOrganization> findUserOrganizations(Long userId);
}

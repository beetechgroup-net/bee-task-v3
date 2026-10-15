package net.beetechgroup.beetask.usecase.user.preferences;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

public class GetUserPreferencesUseCase {
    private final UserRepository userRepository;

    public GetUserPreferencesUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String execute(String email) {
        return userRepository.findByEmail(email)
                .map(User::getPreferences)
                .orElse(null);
    }
}

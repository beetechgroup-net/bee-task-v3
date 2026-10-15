package net.beetechgroup.beetask.usecase.user.preferences;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

public class UpdateUserPreferencesUseCase {
    private static final Logger LOGGER = Logger.getLogger(UpdateUserPreferencesUseCase.class);

    private final UserRepository userRepository;

    public UpdateUserPreferencesUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String execute(String email, String preferences) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    LOGGER.warnf("Preferences update failed: user %s not found", email);
                    return new RuntimeException("User not found");
                });

        user.setPreferences(preferences);
        User saved = userRepository.save(user);

        LOGGER.infof("Preferences updated for user %s", email);
        return saved.getPreferences();
    }
}

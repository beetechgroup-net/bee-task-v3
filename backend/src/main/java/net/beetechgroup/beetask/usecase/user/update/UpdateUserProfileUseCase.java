package net.beetechgroup.beetask.usecase.user.update;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;


public class UpdateUserProfileUseCase {
    private static final Logger LOGGER = Logger.getLogger(UpdateUserProfileUseCase.class);

    private final UserRepository userRepository;

    public UpdateUserProfileUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UpdateUserProfileOutput execute(UpdateUserProfileInput input) {
        User user = userRepository.findByEmail(input.currentEmail())
                .orElseThrow(() -> {
                    LOGGER.warnf("Profile update failed: user %s not found", input.currentEmail());
                    return new RuntimeException("User not found");
                });

        if (!input.currentEmail().equals(input.newEmail())) {
            boolean emailTaken = userRepository.findByEmail(input.newEmail()).isPresent();
            if (emailTaken) {
                LOGGER.warnf("Profile update rejected: email %s already in use", input.newEmail());
                throw new RuntimeException("Email já está em uso por outro usuário");
            }
        }

        user.setName(input.name());
        user.setEmail(input.newEmail());
        User saved = userRepository.save(user);

        LOGGER.infof("Profile updated for user %d: name=%s, email=%s", saved.getId(), saved.getName(), saved.getEmail());

        return new UpdateUserProfileOutput(saved.getName(), saved.getEmail(), saved.getPhoto());
    }
}

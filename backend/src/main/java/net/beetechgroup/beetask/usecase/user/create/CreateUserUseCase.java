package net.beetechgroup.beetask.usecase.user.create;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

public class CreateUserUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateUserUseCase.class);

    private final UserRepository userRepository;

    public CreateUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public CreateUserOutput execute(CreateUserInput input) {
        if (userRepository.findByEmail(input.email()).isPresent()) {
            LOGGER.warnf("User creation rejected because email %s already exists", input.email());
            throw new RuntimeException("User already exists with this email");
        }

        LOGGER.infof("Creating user with email %s", input.email());
        User user = CreateUserMapper.toUser(input);
        User savedUser = userRepository.save(user);
        LOGGER.infof("User %d created successfully with email %s", savedUser.getId(), savedUser.getEmail());

        return CreateUserMapper.toCreateUserOutput(savedUser);
    }
}

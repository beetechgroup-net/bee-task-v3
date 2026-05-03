package net.beetechgroup.beetask.usecase.user.create;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

public class CreateUserUseCase {

    private final UserRepository userRepository;

    public CreateUserUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public CreateUserOutput execute(CreateUserInput input) {
        if (userRepository.findByEmail(input.email()).isPresent()) {
            throw new RuntimeException("User already exists with this email");
        }

        User user = CreateUserMapper.toUser(input);
        User savedUser = userRepository.save(user);

        return CreateUserMapper.toCreateUserOutput(savedUser);
    }
}

package net.beetechgroup.beetask.usecase.user.list;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

import java.util.List;

public class ListAllUsersUseCase {
    private static final Logger LOGGER = Logger.getLogger(ListAllUsersUseCase.class);
    private final UserRepository userRepository;

    public ListAllUsersUseCase(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> execute() {
        LOGGER.info("Executing ListAllUsersUseCase to retrieve all users");
        return userRepository.findAllUsers();
    }
}

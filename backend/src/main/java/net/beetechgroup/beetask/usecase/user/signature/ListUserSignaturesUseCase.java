package net.beetechgroup.beetask.usecase.user.signature;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.UserSignature;
import net.beetechgroup.beetask.usecase.exceptions.UserNotFoundException;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.repository.UserSignatureRepository;

import java.util.List;

public class ListUserSignaturesUseCase {

    private final UserRepository userRepository;
    private final UserSignatureRepository userSignatureRepository;

    public ListUserSignaturesUseCase(UserRepository userRepository, UserSignatureRepository userSignatureRepository) {
        this.userRepository = userRepository;
        this.userSignatureRepository = userSignatureRepository;
    }

    public List<UserSignature> execute(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado: " + userEmail));

        return userSignatureRepository.findByUserId(user.getId());
    }
}

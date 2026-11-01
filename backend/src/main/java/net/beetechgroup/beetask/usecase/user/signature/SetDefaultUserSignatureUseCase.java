package net.beetechgroup.beetask.usecase.user.signature;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.UserSignature;
import net.beetechgroup.beetask.usecase.exceptions.UserNotFoundException;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.repository.UserSignatureRepository;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;

public class SetDefaultUserSignatureUseCase {
    private static final Logger LOGGER = Logger.getLogger(SetDefaultUserSignatureUseCase.class);

    private final UserRepository userRepository;
    private final UserSignatureRepository userSignatureRepository;

    public SetDefaultUserSignatureUseCase(UserRepository userRepository, UserSignatureRepository userSignatureRepository) {
        this.userRepository = userRepository;
        this.userSignatureRepository = userSignatureRepository;
    }

    public UserSignature execute(Long signatureId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado: " + userEmail));

        UserSignature signature = userSignatureRepository.findSignatureById(signatureId)
                .orElseThrow(() -> new IllegalArgumentException("Assinatura não encontrada: " + signatureId));

        if (!signature.getUserId().equals(user.getId())) {
            throw new SecurityException("Você não tem permissão para alterar esta assinatura.");
        }

        userSignatureRepository.unsetDefaultForUser(user.getId());
        signature.setDefault(true);
        signature.setUpdatedAt(LocalDateTime.now());
        UserSignature saved = userSignatureRepository.save(signature);

        LOGGER.infof("Assinatura %d definida como padrão para usuário %s", signatureId, userEmail);
        return saved;
    }
}

package net.beetechgroup.beetask.usecase.user.signature;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.UserSignature;
import net.beetechgroup.beetask.usecase.exceptions.UserNotFoundException;
import net.beetechgroup.beetask.usecase.repository.StorageRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.repository.UserSignatureRepository;
import org.jboss.logging.Logger;

import java.time.LocalDateTime;
import java.util.List;

public class DeleteUserSignatureUseCase {
    private static final Logger LOGGER = Logger.getLogger(DeleteUserSignatureUseCase.class);

    private final UserRepository userRepository;
    private final UserSignatureRepository userSignatureRepository;
    private final StorageRepository storageRepository;

    public DeleteUserSignatureUseCase(UserRepository userRepository,
                                      UserSignatureRepository userSignatureRepository,
                                      StorageRepository storageRepository) {
        this.userRepository = userRepository;
        this.userSignatureRepository = userSignatureRepository;
        this.storageRepository = storageRepository;
    }

    public void execute(Long signatureId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado: " + userEmail));

        UserSignature signature = userSignatureRepository.findSignatureById(signatureId)
                .orElseThrow(() -> new IllegalArgumentException("Assinatura não encontrada: " + signatureId));

        if (!signature.getUserId().equals(user.getId())) {
            throw new SecurityException("Você não tem permissão para excluir esta assinatura.");
        }

        boolean wasDefault = signature.isDefault();

        if (signature.getStorageKey() != null) {
            try {
                storageRepository.delete(signature.getStorageKey());
            } catch (Exception e) {
                LOGGER.warnf("Falha ao remover arquivo de assinatura do storage: %s", e.getMessage());
            }
        }

        userSignatureRepository.delete(signatureId);
        LOGGER.infof("Assinatura %d excluída pelo usuário %s", signatureId, userEmail);

        if (wasDefault) {
            List<UserSignature> remaining = userSignatureRepository.findByUserId(user.getId());
            if (!remaining.isEmpty()) {
                UserSignature nextDefault = remaining.get(0);
                nextDefault.setDefault(true);
                nextDefault.setUpdatedAt(LocalDateTime.now());
                userSignatureRepository.save(nextDefault);
                LOGGER.infof("Assinatura %d promovida a padrão após exclusão da anterior", nextDefault.getId());
            }
        }
    }
}

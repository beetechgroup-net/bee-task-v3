package net.beetechgroup.beetask.usecase.user.signature;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.UserSignature;
import net.beetechgroup.beetask.usecase.exceptions.UserNotFoundException;
import net.beetechgroup.beetask.usecase.repository.StorageRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import net.beetechgroup.beetask.usecase.repository.UserSignatureRepository;
import org.jboss.logging.Logger;

import java.io.ByteArrayInputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CreateUserSignatureUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateUserSignatureUseCase.class);
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;

    private final UserRepository userRepository;
    private final UserSignatureRepository userSignatureRepository;
    private final StorageRepository storageRepository;

    public CreateUserSignatureUseCase(UserRepository userRepository,
                                    UserSignatureRepository userSignatureRepository,
                                    StorageRepository storageRepository) {
        this.userRepository = userRepository;
        this.userSignatureRepository = userSignatureRepository;
        this.storageRepository = storageRepository;
    }

    public UserSignature execute(CreateUserSignatureInput input) {
        if (input.imageBytes() == null || input.imageBytes().length == 0) {
            throw new IllegalArgumentException("A imagem da assinatura é obrigatória.");
        }
        if (input.imageBytes().length > MAX_SIZE_BYTES) {
            throw new IllegalArgumentException("A imagem da assinatura deve ter no máximo 5 MB.");
        }

        User user = userRepository.findByEmail(input.userEmail())
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado: " + input.userEmail()));

        List<UserSignature> existing = userSignatureRepository.findByUserId(user.getId());
        boolean makeDefault = Boolean.TRUE.equals(input.isDefault()) || existing.isEmpty();

        if (makeDefault) {
            userSignatureRepository.unsetDefaultForUser(user.getId());
        }

        String sigName = input.name() != null && !input.name().isBlank()
                ? input.name().trim()
                : "Assinatura " + (existing.size() + 1);

        String type = input.signatureType() != null && !input.signatureType().isBlank()
                ? input.signatureType().toUpperCase()
                : "UPLOAD";

        String contentType = input.contentType() != null && !input.contentType().isBlank()
                ? input.contentType()
                : "image/png";

        String storageKey = "signatures/" + user.getId() + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + ".png";

        String imageUrl = storageRepository.upload(
                storageKey,
                new ByteArrayInputStream(input.imageBytes()),
                contentType,
                input.imageBytes().length
        );

        UserSignature signature = new UserSignature();
        signature.setUserId(user.getId());
        signature.setName(sigName);
        signature.setSignatureType(type);
        signature.setImageUrl(imageUrl);
        signature.setStorageKey(storageKey);
        signature.setDefault(makeDefault);
        signature.setCreatedAt(LocalDateTime.now());
        signature.setUpdatedAt(LocalDateTime.now());

        UserSignature saved = userSignatureRepository.save(signature);
        LOGGER.infof("Assinatura criada com sucesso para usuário %s, ID: %d, Tipo: %s", user.getEmail(), saved.getId(), type);
        return saved;
    }
}

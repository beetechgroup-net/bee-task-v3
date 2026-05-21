package net.beetechgroup.beetask.usecase.user.uploadphoto;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.usecase.repository.StorageRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

public class UploadUserPhotoUseCase {
    private static final Logger LOGGER = Logger.getLogger(UploadUserPhotoUseCase.class);
    private static final long MAX_SIZE_BYTES = 5L * 1024 * 1024;

    private final UserRepository userRepository;
    private final StorageRepository storageRepository;

    public UploadUserPhotoUseCase(UserRepository userRepository, StorageRepository storageRepository) {
        this.userRepository = userRepository;
        this.storageRepository = storageRepository;
    }

    public UploadUserPhotoOutput execute(UploadUserPhotoInput input) {
        if (input.size() > MAX_SIZE_BYTES) {
            throw new RuntimeException("Foto deve ter no máximo 5 MB");
        }
        if (!input.contentType().startsWith("image/")) {
            throw new RuntimeException("O arquivo deve ser uma imagem");
        }

        User user = userRepository.findByEmail(input.email())
                .orElseThrow(() -> {
                    LOGGER.warnf("Photo upload failed: user %s not found", input.email());
                    return new RuntimeException("Usuário não encontrado");
                });

        String key = String.valueOf(user.getId());
        String photoUrl = storageRepository.upload(key, input.data(), input.contentType(), input.size());

        user.setPhoto(photoUrl);
        userRepository.save(user);

        LOGGER.infof("Photo updated for user %d", user.getId());
        return new UploadUserPhotoOutput(photoUrl);
    }
}

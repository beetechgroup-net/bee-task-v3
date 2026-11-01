package net.beetechgroup.beetask.usecase.user.signature;

public record CreateUserSignatureInput(
        String userEmail,
        String name,
        String signatureType,
        Boolean isDefault,
        byte[] imageBytes,
        String contentType
) {}

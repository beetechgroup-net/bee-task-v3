package net.beetechgroup.beetask.interfaceadapters.controllers.user;

import net.beetechgroup.beetask.entities.UserSignature;

import java.time.format.DateTimeFormatter;

public record UserSignatureResponse(
        Long id,
        String name,
        String signatureType,
        String imageUrl,
        boolean isDefault,
        String createdAt
) {
    public static UserSignatureResponse from(UserSignature s) {
        return new UserSignatureResponse(
                s.getId(),
                s.getName(),
                s.getSignatureType(),
                s.getImageUrl(),
                s.isDefault(),
                s.getCreatedAt() != null ? s.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : null
        );
    }
}

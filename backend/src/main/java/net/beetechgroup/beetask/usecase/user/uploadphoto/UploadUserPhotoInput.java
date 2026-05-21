package net.beetechgroup.beetask.usecase.user.uploadphoto;

import java.io.InputStream;

public record UploadUserPhotoInput(String email, InputStream data, String contentType, long size) {}

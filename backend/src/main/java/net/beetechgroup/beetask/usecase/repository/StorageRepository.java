package net.beetechgroup.beetask.usecase.repository;

import java.io.InputStream;

public interface StorageRepository {
    String upload(String key, InputStream data, String contentType, long size);
}

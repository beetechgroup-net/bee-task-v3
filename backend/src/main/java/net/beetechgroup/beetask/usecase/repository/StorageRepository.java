package net.beetechgroup.beetask.usecase.repository;

import java.io.InputStream;

public interface StorageRepository {
    String upload(String key, InputStream data, String contentType, long size);
    InputStream download(String key);
    void delete(String key);
}

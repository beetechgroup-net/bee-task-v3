package net.beetechgroup.beetask.frameworks.storage;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.SetBucketPolicyArgs;
import jakarta.annotation.PostConstruct;
import jakarta.enterprise.context.ApplicationScoped;
import net.beetechgroup.beetask.usecase.repository.StorageRepository;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.io.InputStream;

@ApplicationScoped
public class MinioStorageService implements StorageRepository {
    private static final Logger LOGGER = Logger.getLogger(MinioStorageService.class);

    @ConfigProperty(name = "app.storage.endpoint")
    String endpoint;

    @ConfigProperty(name = "app.storage.access-key")
    String accessKey;

    @ConfigProperty(name = "app.storage.secret-key")
    String secretKey;

    @ConfigProperty(name = "app.storage.bucket")
    String bucket;

    @ConfigProperty(name = "app.storage.public-url")
    String publicUrl;

    private MinioClient minioClient;

    @PostConstruct
    void init() {
        minioClient = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .build();

        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                String publicPolicy = """
                        {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"AWS":["*"]},"Action":["s3:GetObject"],"Resource":["arn:aws:s3:::%s/*"]}]}
                        """.formatted(bucket);
                minioClient.setBucketPolicy(SetBucketPolicyArgs.builder().bucket(bucket).config(publicPolicy).build());
                LOGGER.infof("Bucket '%s' created with public read policy", bucket);
            }
        } catch (Exception e) {
            LOGGER.warnf("Could not initialize MinIO bucket '%s': %s", bucket, e.getMessage());
        }
    }

    @Override
    public String upload(String key, InputStream data, String contentType, long size) {
        try {
            minioClient.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(key)
                    .stream(data, size, -1)
                    .contentType(contentType)
                    .build());
            String url = publicUrl + "/" + bucket + "/" + key;
            LOGGER.infof("Uploaded object '%s' to bucket '%s'", key, bucket);
            return url;
        } catch (Exception e) {
            LOGGER.errorf("Failed to upload object '%s': %s", key, e.getMessage());
            throw new RuntimeException("Falha ao fazer upload da imagem", e);
        }
    }
}

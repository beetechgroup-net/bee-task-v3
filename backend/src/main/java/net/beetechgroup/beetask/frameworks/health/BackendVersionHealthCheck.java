package net.beetechgroup.beetask.frameworks.health;

import java.util.Optional;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.health.HealthCheck;
import org.eclipse.microprofile.health.HealthCheckResponse;
import org.eclipse.microprofile.health.Readiness;

import jakarta.enterprise.context.ApplicationScoped;

@Readiness
@ApplicationScoped
public class BackendVersionHealthCheck implements HealthCheck {

    @ConfigProperty(name = "quarkus.application.version")
    Optional<String> applicationVersion;

    @Override
    public HealthCheckResponse call() {
        return HealthCheckResponse.named("backend-version")
                .up()
                .withData("version", applicationVersion.orElse("unknown"))
                .build();
    }
}

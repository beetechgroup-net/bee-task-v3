package net.beetechgroup.beetask.frameworks.security;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import net.beetechgroup.beetask.frameworks.persistence.entities.UserEntity;
import org.jboss.logging.Logger;
import org.mindrot.jbcrypt.BCrypt;

import java.util.List;

@ApplicationScoped
public class PasswordMigrationStartup {
    private static final Logger LOGGER = Logger.getLogger(PasswordMigrationStartup.class);

    @Inject
    EntityManager em;

    @Transactional
    public void onStart(@Observes StartupEvent ev) {
        LOGGER.info("Checking for unhashed user passwords for active members to migrate to BCrypt...");
        List<UserEntity> users = em.createQuery(
                "SELECT DISTINCT u FROM UserEntity u WHERE u.id IN (SELECT uo.user.id FROM UserOrganizationEntity uo)",
                UserEntity.class).getResultList();
        int migrated = 0;
        for (UserEntity user : users) {
            String pwd = user.getPassword();
            if (pwd != null && !pwd.startsWith("$2a$") && !pwd.startsWith("$2b$") && !pwd.startsWith("$2y$")) {
                user.setPassword(BCrypt.hashpw(pwd, BCrypt.gensalt(10)));
                em.merge(user);
                migrated++;
            }
        }
        if (migrated > 0) {
            LOGGER.infof("Migrated %d user passwords to BCrypt successfully", migrated);
        } else {
            LOGGER.info("All user passwords are already hashed with BCrypt");
        }
    }
}

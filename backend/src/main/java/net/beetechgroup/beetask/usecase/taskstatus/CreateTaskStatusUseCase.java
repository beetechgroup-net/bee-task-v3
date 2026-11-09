package net.beetechgroup.beetask.usecase.taskstatus;

import java.util.List;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.TaskStatusRepository;
import org.jboss.logging.Logger;

public class CreateTaskStatusUseCase {
    private static final Logger LOGGER = Logger.getLogger(CreateTaskStatusUseCase.class);

    private final TaskStatusRepository taskStatusRepository;
    private final OrganizationRepository organizationRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public CreateTaskStatusUseCase(TaskStatusRepository taskStatusRepository,
                                  OrganizationRepository organizationRepository,
                                  AuthorizeOrganizationMemberUseCase authorizer) {
        this.taskStatusRepository = taskStatusRepository;
        this.organizationRepository = organizationRepository;
        this.authorizer = authorizer;
    }

    public TaskStatusOutput execute(CreateTaskStatusInput input) {
        authorizer.execute(input.userEmail(), input.organizationId());

        String trimmedName = input.name() != null ? input.name().trim() : "";
        if (trimmedName.isBlank()) {
            throw new IllegalArgumentException("O nome do status é obrigatório.");
        }

        if (taskStatusRepository.existsByNameInOrganization(input.organizationId(), trimmedName, null)) {
            throw new IllegalStateException("Já existe um status com o nome '" + trimmedName + "' nesta organização.");
        }

        Organization org = organizationRepository.findOrganizationById(input.organizationId())
                .orElseThrow(() -> new IllegalArgumentException("Organização não encontrada: " + input.organizationId()));

        List<TaskStatus> existing = taskStatusRepository.findByOrganizationId(input.organizationId());

        int position = input.position() != null ? input.position() :
                existing.stream().mapToInt(TaskStatus::getPosition).max().orElse(-1) + 1;

        boolean isDefault = Boolean.TRUE.equals(input.isDefault());
        if (isDefault) {
            // Unset previous default
            for (TaskStatus s : existing) {
                if (s.isDefault()) {
                    s.setDefault(false);
                    taskStatusRepository.saveTaskStatus(s);
                }
            }
        }

        TaskStatus status = new TaskStatus();
        status.setName(trimmedName);
        status.setColor(input.color() != null && !input.color().isBlank() ? input.color().trim() : "#71717a");
        status.setPosition(position);
        status.setDefault(isDefault);
        status.setCompleted(Boolean.TRUE.equals(input.isCompleted()));
        status.setCanceled(Boolean.TRUE.equals(input.isCanceled()));
        status.setOrganization(org);

        status = taskStatusRepository.saveTaskStatus(status);
        LOGGER.infof("Created task status %d ('%s') in organization %d", status.getId(), status.getName(), org.getId());

        return TaskStatusMapper.toOutput(status, 0);
    }
}

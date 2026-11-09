package net.beetechgroup.beetask.usecase.taskstatus;

import java.util.List;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskStatusRepository;
import org.jboss.logging.Logger;

public class UpdateTaskStatusInfoUseCase {
    private static final Logger LOGGER = Logger.getLogger(UpdateTaskStatusInfoUseCase.class);

    private final TaskStatusRepository taskStatusRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public UpdateTaskStatusInfoUseCase(TaskStatusRepository taskStatusRepository,
                                       AuthorizeOrganizationMemberUseCase authorizer) {
        this.taskStatusRepository = taskStatusRepository;
        this.authorizer = authorizer;
    }

    public TaskStatusOutput execute(UpdateTaskStatusInput input) {
        authorizer.execute(input.userEmail(), input.organizationId());

        TaskStatus status = taskStatusRepository.findTaskStatusById(input.id())
                .orElseThrow(() -> new IllegalArgumentException("Status não encontrado: " + input.id()));

        if (!status.getOrganization().getId().equals(input.organizationId())) {
            throw new SecurityException("Este status não pertence à organização informada.");
        }

        String trimmedName = input.name() != null ? input.name().trim() : "";
        if (trimmedName.isBlank()) {
            throw new IllegalArgumentException("O nome do status é obrigatório.");
        }

        if (taskStatusRepository.existsByNameInOrganization(input.organizationId(), trimmedName, status.getId())) {
            throw new IllegalStateException("Já existe um status com o nome '" + trimmedName + "' nesta organização.");
        }

        boolean isDefault = Boolean.TRUE.equals(input.isDefault());
        if (isDefault && !status.isDefault()) {
            List<TaskStatus> all = taskStatusRepository.findByOrganizationId(input.organizationId());
            for (TaskStatus s : all) {
                if (!s.getId().equals(status.getId()) && s.isDefault()) {
                    s.setDefault(false);
                    taskStatusRepository.saveTaskStatus(s);
                }
            }
        }

        status.setName(trimmedName);
        if (input.color() != null && !input.color().isBlank()) {
            status.setColor(input.color().trim());
        }
        if (input.position() != null) {
            status.setPosition(input.position());
        }
        if (input.isDefault() != null) {
            status.setDefault(input.isDefault());
        }
        if (input.isCompleted() != null) {
            status.setCompleted(input.isCompleted());
        }
        if (input.isCanceled() != null) {
            status.setCanceled(input.isCanceled());
        }

        status = taskStatusRepository.saveTaskStatus(status);
        long count = taskStatusRepository.countTasksByStatusId(status.getId());
        LOGGER.infof("Updated task status %d ('%s') in organization %d", status.getId(), status.getName(), input.organizationId());

        return TaskStatusMapper.toOutput(status, count);
    }
}

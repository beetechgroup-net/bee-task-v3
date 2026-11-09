package net.beetechgroup.beetask.usecase.taskstatus;

import java.util.List;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.TaskStatusRepository;
import org.jboss.logging.Logger;

public class DeleteTaskStatusUseCase {
    private static final Logger LOGGER = Logger.getLogger(DeleteTaskStatusUseCase.class);

    private final TaskStatusRepository taskStatusRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public DeleteTaskStatusUseCase(TaskStatusRepository taskStatusRepository,
                                  AuthorizeOrganizationMemberUseCase authorizer) {
        this.taskStatusRepository = taskStatusRepository;
        this.authorizer = authorizer;
    }

    public void execute(String userEmail, Long organizationId, Long statusId, Long moveToStatusId) {
        authorizer.execute(userEmail, organizationId);

        TaskStatus status = taskStatusRepository.findTaskStatusById(statusId)
                .orElseThrow(() -> new IllegalArgumentException("Status não encontrado: " + statusId));

        if (!status.getOrganization().getId().equals(organizationId)) {
            throw new SecurityException("Este status não pertence à organização informada.");
        }

        List<TaskStatus> all = taskStatusRepository.findByOrganizationId(organizationId);
        if (all.size() <= 1) {
            throw new IllegalStateException("A organização deve manter pelo menos um status.");
        }

        long count = taskStatusRepository.countTasksByStatusId(statusId);
        if (count > 0) {
            if (moveToStatusId == null) {
                throw new IllegalStateException("Existem " + count + " tarefas associadas a este status. Escolha para qual status deseja movê-las antes de excluir.");
            }
            if (moveToStatusId.equals(statusId)) {
                throw new IllegalArgumentException("O status de destino não pode ser o mesmo a ser excluído.");
            }
            TaskStatus targetStatus = taskStatusRepository.findTaskStatusById(moveToStatusId)
                    .orElseThrow(() -> new IllegalArgumentException("Status de destino não encontrado: " + moveToStatusId));
            if (!targetStatus.getOrganization().getId().equals(organizationId)) {
                throw new SecurityException("O status de destino não pertence à mesma organização.");
            }

            taskStatusRepository.reassignTasks(statusId, moveToStatusId);
        }

        taskStatusRepository.deleteTaskStatus(status);
        LOGGER.infof("Status %d ('%s') deleted from organization %d by user %s", statusId, status.getName(), organizationId, userEmail);
    }
}

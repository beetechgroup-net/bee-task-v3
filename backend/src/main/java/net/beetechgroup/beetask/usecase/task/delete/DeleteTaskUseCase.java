package net.beetechgroup.beetask.usecase.task.delete;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationRole;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

import java.util.Optional;

public class DeleteTaskUseCase {
    private static final Logger LOGGER = Logger.getLogger(DeleteTaskUseCase.class);

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final UserOrganizationRepository userOrganizationRepository;

    public DeleteTaskUseCase(TaskRepository taskRepository,
                             UserRepository userRepository,
                             UserOrganizationRepository userOrganizationRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.userOrganizationRepository = userOrganizationRepository;
    }

    public void execute(Long taskId, String userEmail) {
        LOGGER.infof("Delete task %d requested by %s", taskId, userEmail);

        Task task = taskRepository.findTaskById(taskId);

        User requester = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new SecurityException("Usuário não encontrado: " + userEmail));

        // 1. Check if requester is the task creator/owner
        boolean isCreatorOrOwner = false;
        if (task.getCreatedBy() != null && task.getCreatedBy().getId() != null && task.getCreatedBy().getId().equals(requester.getId())) {
            isCreatorOrOwner = true;
        } else if (task.getUser() != null && task.getUser().getId() != null && task.getUser().getId().equals(requester.getId())) {
            isCreatorOrOwner = true;
        }

        // 2. Check if requester is admin/owner of the task's organization
        Long taskOrgId = null;
        if (task.getOrganization() != null) {
            taskOrgId = task.getOrganization().getId();
        } else if (task.getProject() != null && task.getProject().getOrganization() != null) {
            taskOrgId = task.getProject().getOrganization().getId();
        } else if (task.getCategory() != null && task.getCategory().getOrganization() != null) {
            taskOrgId = task.getCategory().getOrganization().getId();
        }

        boolean isOrgAdmin = false;
        if (taskOrgId != null) {
            Optional<UserOrganization> uo = userOrganizationRepository.findByUserAndOrganization(requester.getId(), taskOrgId);
            if (uo.isPresent() && uo.get().getStatus() == UserOrganizationStatus.ACTIVE) {
                UserOrganizationRole role = uo.get().getRole();
                if (role == UserOrganizationRole.OWNER || role == UserOrganizationRole.ADMIN) {
                    isOrgAdmin = true;
                }
            }
        }

        if (!isCreatorOrOwner && !isOrgAdmin) {
            LOGGER.warnf("User %s denied deletion of task %d. isCreatorOrOwner=%b, isOrgAdmin=%b, taskOrgId=%d",
                    userEmail, taskId, isCreatorOrOwner, isOrgAdmin, taskOrgId);
            throw new SecurityException("Você não tem permissão para excluir esta tarefa. Apenas o criador ou administradores da organização podem excluí-la.");
        }

        taskRepository.deleteTask(taskId);
        LOGGER.infof("Task %d deleted successfully by user %s", taskId, userEmail);
    }
}

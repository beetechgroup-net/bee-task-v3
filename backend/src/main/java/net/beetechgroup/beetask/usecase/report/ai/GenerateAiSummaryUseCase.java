package net.beetechgroup.beetask.usecase.report.ai;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.report.ReportSection;
import net.beetechgroup.beetask.entities.report.ReportTemplate;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.frameworks.ai.OllamaService;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.ReportTemplateRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

public class GenerateAiSummaryUseCase {
    private static final Logger LOGGER = Logger.getLogger(GenerateAiSummaryUseCase.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final ReportTemplateRepository reportTemplateRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;
    private final OllamaService ollamaService;

    public GenerateAiSummaryUseCase(
            ReportTemplateRepository reportTemplateRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            AuthorizeOrganizationMemberUseCase authorizer,
            OllamaService ollamaService
    ) {
        this.reportTemplateRepository = reportTemplateRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.authorizer = authorizer;
        this.ollamaService = ollamaService;
    }

    public String execute(
            String userEmail,
            Long organizationId,
            Long templateId,
            String sectionKey,
            LocalDate startDate,
            LocalDate endDate,
            String customPrompt
    ) {
        authorizer.execute(userEmail, organizationId);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + userEmail));

        LocalDateTime startDt = startDate != null ? startDate.atStartOfDay() : LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime endDt = endDate != null ? endDate.atTime(23, 59, 59) : LocalDate.now().atTime(23, 59, 59);

        String systemPrompt = customPrompt;
        Long filterCategoryId = null;

        if (templateId != null) {
            ReportTemplate template = reportTemplateRepository.findReportTemplateById(templateId).orElse(null);
            if (template != null && template.getSections() != null && sectionKey != null) {
                for (ReportSection s : template.getSections()) {
                    if (sectionKey.equalsIgnoreCase(s.getSectionKey())) {
                        if (systemPrompt == null || systemPrompt.isBlank()) {
                            systemPrompt = s.getAiPrompt();
                        }
                        if (s.getFilterCategory() != null) {
                            filterCategoryId = s.getFilterCategory().getId();
                        }
                        break;
                    }
                }
            }
        }

        // Carregar tarefas do usuário no período
        List<Task> workedTasks = taskRepository.findTasksWorkedByUserInPeriod(userEmail, startDt, endDt, organizationId);
        List<Task> finishedTasks = taskRepository.findTasksFinishedByUserInPeriod(userEmail, startDt, endDt);

        Map<Long, Task> uniqueTasks = new LinkedHashMap<>();
        for (Task t : workedTasks) {
            if (matchesOrg(t, organizationId)) {
                uniqueTasks.put(t.getId(), t);
            }
        }
        for (Task t : finishedTasks) {
            if (matchesOrg(t, organizationId)) {
                uniqueTasks.put(t.getId(), t);
            }
        }

        List<Task> allUserTasks = taskRepository.findTasksByUser(userEmail);
        for (Task t : allUserTasks) {
            if (matchesOrg(t, organizationId) && hasActivityInPeriod(t, startDt, endDt)) {
                uniqueTasks.put(t.getId(), t);
            }
        }

        List<Task> taskList = new ArrayList<>(uniqueTasks.values());

        // Filtrar por categoria se aplicável
        if (filterCategoryId != null) {
            final Long finalCatId = filterCategoryId;
            taskList = taskList.stream()
                    .filter(t -> t.getCategory() != null && Objects.equals(t.getCategory().getId(), finalCatId))
                    .toList();
        }

        String tasksContext = buildTasksContext(taskList, startDate, endDate);
        LOGGER.infof("Gerando resumo com IA para %s (%d tarefas)...", userEmail, taskList.size());

        String summary = ollamaService != null ? ollamaService.generateSummary(systemPrompt, tasksContext) : null;
        return summary != null ? summary : "Não foi possível gerar o resumo com IA neste momento.";
    }

    private boolean matchesOrg(Task t, Long orgId) {
        return t.getOrganization() == null || Objects.equals(t.getOrganization().getId(), orgId);
    }

    private boolean hasActivityInPeriod(Task t, LocalDateTime startDt, LocalDateTime endDt) {
        if (t.getFinishedAt() != null && !t.getFinishedAt().isBefore(startDt) && !t.getFinishedAt().isAfter(endDt)) {
            return true;
        }
        if (t.getHistory() != null) {
            for (TaskHistoryItem h : t.getHistory()) {
                if (h.getStartAt() != null && !h.getStartAt().isAfter(endDt)) {
                    LocalDateTime itemEnd = h.getEndAt() != null ? h.getEndAt() : LocalDateTime.now();
                    if (!itemEnd.isBefore(startDt)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private String buildTasksContext(List<Task> tasks, LocalDate start, LocalDate end) {
        if (tasks == null || tasks.isEmpty()) return "";
        StringBuilder sb = new StringBuilder();
        sb.append("Tarefas do período (")
                .append(start != null ? start.format(DATE_FORMATTER) : "")
                .append(" a ")
                .append(end != null ? end.format(DATE_FORMATTER) : "")
                .append("):\n");

        for (int i = 0; i < tasks.size(); i++) {
            Task t = tasks.get(i);
            sb.append(i + 1).append(". ");
            if (t.getCategory() != null) {
                sb.append("[").append(t.getCategory().getName()).append("] ");
            }
            sb.append(t.getTitle());
            if (t.getProject() != null) {
                sb.append(" (Projeto: ").append(t.getProject().getName()).append(")");
            }
            if (t.getDescription() != null && !t.getDescription().isBlank()) {
                String cleanDesc = t.getDescription().replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
                if (!cleanDesc.isEmpty()) {
                    sb.append(" - ").append(cleanDesc);
                }
            }
            sb.append("\n");
        }
        return sb.toString();
    }
}

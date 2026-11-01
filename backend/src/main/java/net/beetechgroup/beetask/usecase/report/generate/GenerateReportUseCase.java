package net.beetechgroup.beetask.usecase.report.generate;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.organization.Organization;
import net.beetechgroup.beetask.entities.report.GeneratedReport;
import net.beetechgroup.beetask.entities.report.ReportSection;
import net.beetechgroup.beetask.entities.report.ReportTemplate;
import net.beetechgroup.beetask.entities.task.Task;
import net.beetechgroup.beetask.entities.task.TaskHistoryItem;
import net.beetechgroup.beetask.entities.task.TaskStatus;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.report.docengine.DocxReportEngine;
import net.beetechgroup.beetask.usecase.repository.GeneratedReportRepository;
import net.beetechgroup.beetask.usecase.repository.OrganizationRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.ReportTemplateRepository;
import net.beetechgroup.beetask.usecase.repository.StorageRepository;
import net.beetechgroup.beetask.usecase.repository.TaskRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;
import org.jboss.logging.Logger;

public class GenerateReportUseCase {
    private static final Logger LOGGER = Logger.getLogger(GenerateReportUseCase.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Locale PT_BR = new Locale("pt", "BR");

    private final ReportTemplateRepository reportTemplateRepository;
    private final GeneratedReportRepository generatedReportRepository;
    private final TaskRepository taskRepository;
    private final OrganizationRepository organizationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final StorageRepository storageRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public GenerateReportUseCase(
            ReportTemplateRepository reportTemplateRepository,
            GeneratedReportRepository generatedReportRepository,
            TaskRepository taskRepository,
            OrganizationRepository organizationRepository,
            ProjectRepository projectRepository,
            UserRepository userRepository,
            StorageRepository storageRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        this.reportTemplateRepository = reportTemplateRepository;
        this.generatedReportRepository = generatedReportRepository;
        this.taskRepository = taskRepository;
        this.organizationRepository = organizationRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
        this.storageRepository = storageRepository;
        this.authorizer = authorizer;
    }

    public GenerateReportOutput execute(GenerateReportInput input) {
        authorizer.execute(input.userEmail(), input.organizationId());

        if (input.startDate() == null || input.endDate() == null) {
            throw new IllegalArgumentException("Data de início e data de fim são obrigatórias");
        }
        if (input.startDate().isAfter(input.endDate())) {
            throw new IllegalArgumentException("A data de início não pode ser posterior à data de fim");
        }

        ReportTemplate template = reportTemplateRepository.findReportTemplateById(input.templateId())
                .orElseThrow(() -> new IllegalArgumentException("Modelo de relatório não encontrado"));

        Organization org = organizationRepository.findOrganizationById(input.organizationId())
                .orElseThrow(() -> new IllegalArgumentException("Organização não encontrada"));

        User user = userRepository.findByEmail(input.userEmail())
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));

        Long selectedProjectId = input.projectId() != null && input.projectId() > 0
                ? input.projectId()
                : (template.getProject() != null ? template.getProject().getId() : null);

        Project project = selectedProjectId != null
                ? projectRepository.findProjectById(selectedProjectId).orElse(null)
                : null;

        LocalDateTime startDt = input.startDate().atStartOfDay();
        LocalDateTime endDt = input.endDate().atTime(23, 59, 59);

        // 1. Carregar tarefas do usuário no período
        List<Task> workedTasks = taskRepository.findTasksWorkedByUserInPeriod(input.userEmail(), startDt, endDt, org.getId());
        List<Task> finishedTasks = taskRepository.findTasksFinishedByUserInPeriod(input.userEmail(), startDt, endDt);

        // Mesclar tarefas únicas
        Map<Long, Task> uniqueTasks = new LinkedHashMap<>();
        for (Task t : workedTasks) {
            if (matchesOrgAndProject(t, org.getId(), selectedProjectId)) {
                uniqueTasks.put(t.getId(), t);
            }
        }
        for (Task t : finishedTasks) {
            if (matchesOrgAndProject(t, org.getId(), selectedProjectId)) {
                uniqueTasks.put(t.getId(), t);
            }
        }

        // Também incluir tarefas criadas/atribuídas ao usuário no período se aplicável
        List<Task> allUserTasks = taskRepository.findTasksByUser(input.userEmail());
        for (Task t : allUserTasks) {
            if (matchesOrgAndProject(t, org.getId(), selectedProjectId)) {
                // Se a tarefa teve apontamentos de tempo ou foi finalizada no período
                if (hasActivityInPeriod(t, startDt, endDt)) {
                    uniqueTasks.put(t.getId(), t);
                }
            }
        }

        List<Task> taskList = new ArrayList<>(uniqueTasks.values());

        // 2. Montar variáveis globais
        Map<String, String> variables = new HashMap<>();
        String strStart = input.startDate().format(DATE_FORMATTER);
        String strEnd = input.endDate().format(DATE_FORMATTER);

        String monthName = input.startDate().getMonth().getDisplayName(TextStyle.FULL, PT_BR);
        String mesAno = capitalize(monthName) + "/" + input.startDate().getYear();

        String userName = user.getName() != null && !user.getName().isBlank() ? user.getName() : user.getEmail();
        String managerName = template.getManagerName() != null ? template.getManagerName() : "";
        String projectName = template.getCustomProjectName() != null && !template.getCustomProjectName().isBlank()
                ? template.getCustomProjectName()
                : (project != null ? project.getName() : "Geral / Todos os Projetos");

        // Nome do Usuário / Colaborador
        variables.put("nome", userName);
        variables.put("nome_usuario", userName);
        variables.put("colaborador", userName);
        variables.put("email_usuario", user.getEmail());

        // Gestor Responsável
        variables.put("gestor", managerName);
        variables.put("nome_gestor", managerName);

        // Projeto
        variables.put("projeto", projectName);
        variables.put("nome_projeto", projectName);
        variables.put("organizacao", org.getName());

        // Datas
        variables.put("data_inicio", strStart);
        variables.put("data_fim", strEnd);
        variables.put("mes_ano", mesAno);
        variables.put("data_emissao", LocalDate.now().format(DATE_FORMATTER));

        // Valores padrão das seções configuradas no modelo
        if (template.getSections() != null) {
            for (ReportSection sec : template.getSections()) {
                if (("FREE_TEXT".equalsIgnoreCase(sec.getSectionType()) || "FIXED_TEXT".equalsIgnoreCase(sec.getSectionType()))
                        && sec.getDefaultValue() != null) {
                    variables.put(sec.getSectionKey(), sec.getDefaultValue());
                } else if ("DATE".equalsIgnoreCase(sec.getSectionType())) {
                    String datePattern = sec.getDateFormat() != null && !sec.getDateFormat().isBlank()
                            ? sec.getDateFormat().trim()
                            : "DD/MM/AAAA";
                    String formattedVal;
                    String customVal = input.customFields() != null ? input.customFields().get(sec.getSectionKey()) : null;
                    if (customVal != null && !customVal.isBlank()) {
                        try {
                            LocalDate d = LocalDate.parse(customVal.trim());
                            formattedVal = formatSingleDate(d, datePattern);
                        } catch (Exception e) {
                            formattedVal = customVal.trim();
                        }
                    } else {
                        if (isPeriodPattern(datePattern) || sec.getSectionKey().contains("periodo") || sec.getSectionKey().contains("vigencia")) {
                            formattedVal = formatPeriodWithPattern(input.startDate(), input.endDate(), datePattern);
                        } else if (sec.getSectionKey().contains("fim") || sec.getSectionKey().contains("termino")) {
                            formattedVal = formatSingleDate(input.endDate(), datePattern);
                        } else if (sec.getSectionKey().contains("inicio")) {
                            formattedVal = formatSingleDate(input.startDate(), datePattern);
                        } else if (sec.getSectionKey().contains("emissao") || sec.getSectionKey().contains("hoje")) {
                            formattedVal = formatSingleDate(LocalDate.now(), datePattern);
                        } else {
                            formattedVal = isPeriodPattern(datePattern)
                                    ? formatPeriodWithPattern(input.startDate(), input.endDate(), datePattern)
                                    : formatSingleDate(input.endDate(), datePattern);
                        }
                    }
                    variables.put(sec.getSectionKey(), formattedVal);
                }
            }
        }

        // Incorporar campos de texto customizados enviados pelo usuário
        if (input.customFields() != null) {
            for (Map.Entry<String, String> entry : input.customFields().entrySet()) {
                if (entry.getValue() != null && !entry.getValue().isBlank()) {
                    variables.put(entry.getKey(), entry.getValue());
                }
            }
        }

        // 4. Montar seções de listagem de tarefas / reuniões
        Map<String, List<DocxReportEngine.TaskItem>> listSections = new HashMap<>();

        if (template.getSections() != null) {
            for (ReportSection section : template.getSections()) {
                if ("TASK_LIST".equalsIgnoreCase(section.getSectionType())) {
                    List<DocxReportEngine.TaskItem> items = new ArrayList<>();
                    for (Task t : taskList) {
                        if (matchesSectionFilters(t, section)) {
                            long sec = calculateTaskSecondsInPeriod(t, user.getEmail(), startDt, endDt);
                            String dur = section.getIncludeTime() && sec > 0 ? formatDuration(sec) : "";
                            String dateStr = t.getFinishedAt() != null
                                    ? t.getFinishedAt().format(DATE_FORMATTER)
                                    : strEnd;
                            String statusLabel = formatStatus(t.getStatus());
                            String catName = t.getCategory() != null ? t.getCategory().getName() : "";
                            String projName = t.getProject() != null ? t.getProject().getName() : "";

                            items.add(new DocxReportEngine.TaskItem(
                                    t.getTitle(),
                                    dateStr,
                                    dur,
                                    statusLabel,
                                    catName,
                                    projName,
                                    t.getDescription()
                            ));
                        }
                    }
                    listSections.put(section.getSectionKey(), items);
                } else if ("FREE_TEXT".equalsIgnoreCase(section.getSectionType())) {
                    // Garantir que a chave existe nas variáveis mesmo se veio vazia
                    if (!variables.containsKey(section.getSectionKey())) {
                        variables.put(section.getSectionKey(), "");
                    }
                }
            }
        }

        // Fallbacks para tags comuns se não foram explicitamente seções
        if (!listSections.containsKey("atividades")) {
            List<DocxReportEngine.TaskItem> allItems = new ArrayList<>();
            for (Task t : taskList) {
                long sec = calculateTaskSecondsInPeriod(t, user.getEmail(), startDt, endDt);
                allItems.add(new DocxReportEngine.TaskItem(
                        t.getTitle(),
                        t.getFinishedAt() != null ? t.getFinishedAt().format(DATE_FORMATTER) : strEnd,
                        sec > 0 ? formatDuration(sec) : "",
                        formatStatus(t.getStatus()),
                        t.getCategory() != null ? t.getCategory().getName() : "",
                        t.getProject() != null ? t.getProject().getName() : "",
                        t.getDescription()
                ));
            }
            listSections.put("atividades", allItems);
        }

        // 5. Baixar o template do MinIO e gerar o documento preenchido
        byte[] docxBytes;
        try (InputStream templateStream = storageRepository.download(template.getStorageKey())) {
            docxBytes = DocxReportEngine.generate(templateStream, variables, listSections);
        } catch (Exception e) {
            LOGGER.errorf("Erro ao processar template .docx %d: %s", template.getId(), e.getMessage());
            throw new RuntimeException("Falha ao gerar o documento Word: " + e.getMessage(), e);
        }

        // 6. Fazer upload do relatório gerado para o MinIO
        String cleanTitle = (template.getName() + "_" + strStart.replace("/", "-") + "_" + strEnd.replace("/", "-"))
                .replaceAll("[^a-zA-Z0-9._-]", "_");
        String generatedFileName = cleanTitle + ".docx";
        String generatedStorageKey = "reports/generated/" + org.getId() + "/" + UUID.randomUUID() + "_" + generatedFileName;
        String contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

        String fileUrl = storageRepository.upload(
                generatedStorageKey,
                new ByteArrayInputStream(docxBytes),
                contentType,
                docxBytes.length
        );

        // 7. Persistir histórico do relatório gerado
        GeneratedReport generated = new GeneratedReport();
        generated.setReportTemplateId(template.getId());
        generated.setOrganization(org);
        generated.setProject(project);
        generated.setUser(user);
        generated.setTitle(template.getName() + " (" + strStart + " a " + strEnd + ")");
        generated.setStartDate(input.startDate());
        generated.setEndDate(input.endDate());
        generated.setFileUrl(fileUrl);
        generated.setFileName(generatedFileName);
        generated.setStorageKey(generatedStorageKey);
        generated.setCreatedAt(LocalDateTime.now());

        GeneratedReport savedReport = generatedReportRepository.saveGeneratedReport(generated);
        LOGGER.infof("Relatório gerado com sucesso! ID: %d, Arquivo: %s", savedReport.getId(), generatedFileName);

        return new GenerateReportOutput(
                docxBytes,
                generatedFileName,
                contentType,
                fileUrl,
                savedReport.getId()
        );
    }

    private boolean matchesOrgAndProject(Task t, Long orgId, Long projectId) {
        if (t.getOrganization() != null && !Objects.equals(t.getOrganization().getId(), orgId)) {
            return false;
        }
        if (projectId != null && (t.getProject() == null || !Objects.equals(t.getProject().getId(), projectId))) {
            return false;
        }
        return true;
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

    private boolean matchesSectionFilters(Task t, ReportSection section) {
        if (section.getFilterCategory() != null) {
            if (t.getCategory() == null || !Objects.equals(t.getCategory().getId(), section.getFilterCategory().getId())) {
                return false;
            }
        }
        if (section.getFilterStatus() != null && !section.getFilterStatus().equalsIgnoreCase("ALL")) {
            if (t.getStatus() == null || !t.getStatus().name().equalsIgnoreCase(section.getFilterStatus())) {
                return false;
            }
        }
        return true;
    }

    private long calculateTaskSecondsInPeriod(Task t, String userEmail, LocalDateTime start, LocalDateTime end) {
        if (t.getHistory() == null || t.getHistory().isEmpty()) return 0;
        long totalSeconds = 0;
        for (TaskHistoryItem item : t.getHistory()) {
            if (item.getUser() != null && !userEmail.equalsIgnoreCase(item.getUser().getEmail())) {
                continue;
            }
            if (item.getStartAt() == null) continue;
            LocalDateTime itemStart = item.getStartAt().isBefore(start) ? start : item.getStartAt();
            LocalDateTime itemEnd = item.getEndAt() != null ? item.getEndAt() : LocalDateTime.now();
            if (itemEnd.isAfter(end)) itemEnd = end;

            if (itemEnd.isAfter(itemStart)) {
                totalSeconds += Duration.between(itemStart, itemEnd).toSeconds();
            }
        }
        return totalSeconds;
    }

    private String formatDuration(long seconds) {
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        if (hours == 0 && minutes == 0 && seconds > 0) return "1m";
        return hours + "h " + minutes + "m";
    }

    private String formatStatus(TaskStatus status) {
        if (status == null) return "";
        return switch (status) {
            case COMPLETED -> "Concluído";
            case IN_PROGRESS -> "Em Andamento";
            case NOT_STARTED -> "A Fazer";
            case CANCELED -> "Cancelado";
        };
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) return "";
        return text.substring(0, 1).toUpperCase(PT_BR) + text.substring(1);
    }

    private boolean isPeriodPattern(String pattern) {
        if (pattern == null) return false;
        return pattern.contains("até") || pattern.contains(" a ") || pattern.contains(" - ");
    }

    private String formatSingleDate(LocalDate date, String pattern) {
        if (date == null) return "";
        if (pattern == null || pattern.isBlank()) pattern = "DD/MM/AAAA";

        return switch (pattern) {
            case "DD/MM/AAAA" -> date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            case "DD-MM-AAAA" -> date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
            case "AAAA-MM-DD" -> date.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            case "DD de Mês de AAAA" -> {
                String m = capitalize(date.getMonth().getDisplayName(TextStyle.FULL, PT_BR));
                yield String.format("%02d de %s de %d", date.getDayOfMonth(), m, date.getYear());
            }
            case "MM/AAAA" -> date.format(DateTimeFormatter.ofPattern("MM/yyyy"));
            case "Mês de AAAA" -> {
                String m = capitalize(date.getMonth().getDisplayName(TextStyle.FULL, PT_BR));
                yield m + " de " + date.getYear();
            }
            default -> {
                if (pattern.contains("-")) {
                    yield date.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
                }
                yield date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
            }
        };
    }

    private String formatPeriodWithPattern(LocalDate start, LocalDate end, String pattern) {
        if (pattern == null || pattern.isBlank()) {
            pattern = "DD/MM/AAAA até DD/MM/AAAA";
        }

        String strSlashStart = start.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String strSlashEnd = end.format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        String strDashStart = start.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));
        String strDashEnd = end.format(DateTimeFormatter.ofPattern("dd-MM-yyyy"));

        return switch (pattern) {
            case "DD/MM/AAAA até DD/MM/AAAA" -> strSlashStart + " até " + strSlashEnd;
            case "DD-MM-AAAA até DD-MM-AAAA" -> strDashStart + " até " + strDashEnd;
            case "DD/MM/AAAA a DD/MM/AAAA" -> strSlashStart + " a " + strSlashEnd;
            case "DD-MM-AAAA a DD-MM-AAAA" -> strDashStart + " a " + strDashEnd;
            case "DD de Mês de AAAA até DD de Mês de AAAA" -> {
                String mStart = capitalize(start.getMonth().getDisplayName(TextStyle.FULL, PT_BR));
                String mEnd = capitalize(end.getMonth().getDisplayName(TextStyle.FULL, PT_BR));
                yield String.format("%02d de %s de %d até %02d de %s de %d",
                        start.getDayOfMonth(), mStart, start.getYear(),
                        end.getDayOfMonth(), mEnd, end.getYear());
            }
            case "MM/AAAA" -> String.format("%02d/%d", start.getMonthValue(), start.getYear());
            case "Mês de AAAA" -> {
                String mStart = capitalize(start.getMonth().getDisplayName(TextStyle.FULL, PT_BR));
                yield mStart + " de " + start.getYear();
            }
            case "DD/MM - DD/MM/AAAA" -> String.format("%02d/%02d - %02d/%02d/%d",
                    start.getDayOfMonth(), start.getMonthValue(),
                    end.getDayOfMonth(), end.getMonthValue(), end.getYear());
            case "DD-MM-AAAA" -> strDashStart;
            case "DD/MM/AAAA" -> strSlashStart;
            case "AAAA-MM-DD" -> start.format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
            default -> strSlashStart + " até " + strSlashEnd;
        };
    }
}

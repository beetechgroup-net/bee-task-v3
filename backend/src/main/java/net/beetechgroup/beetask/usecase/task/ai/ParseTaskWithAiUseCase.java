package net.beetechgroup.beetask.usecase.task.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.entities.organization.UserOrganization;
import net.beetechgroup.beetask.entities.organization.UserOrganizationStatus;
import net.beetechgroup.beetask.frameworks.ai.OllamaService;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import net.beetechgroup.beetask.usecase.repository.UserOrganizationRepository;
import org.jboss.logging.Logger;

import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

public class ParseTaskWithAiUseCase {
    private static final Logger LOGGER = Logger.getLogger(ParseTaskWithAiUseCase.class);

    private final OllamaService ollamaService;
    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;
    private final UserOrganizationRepository userOrganizationRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;
    private final ObjectMapper objectMapper;

    public ParseTaskWithAiUseCase(
            OllamaService ollamaService,
            ProjectRepository projectRepository,
            CategoryRepository categoryRepository,
            UserOrganizationRepository userOrganizationRepository,
            AuthorizeOrganizationMemberUseCase authorizer,
            ObjectMapper objectMapper
    ) {
        this.ollamaService = ollamaService;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.userOrganizationRepository = userOrganizationRepository;
        this.authorizer = authorizer;
        this.objectMapper = objectMapper;
    }

    public ParsedTaskOutput execute(ParseTaskWithAiInput input) {
        if (input.prompt() == null || input.prompt().isBlank()) {
            throw new IllegalArgumentException("O prompt da tarefa não pode estar vazio.");
        }

        authorizer.execute(input.userEmail(), input.organizationId());

        List<Project> projects = input.organizationId() != null
                ? projectRepository.findByOrganizationId(input.organizationId())
                : List.of();
        List<Category> categories = input.organizationId() != null
                ? categoryRepository.findByOrganizationId(input.organizationId())
                : List.of();
        List<UserOrganization> members = input.organizationId() != null
                ? userOrganizationRepository.findByOrganizationIdAndStatus(input.organizationId(), UserOrganizationStatus.ACTIVE)
                : List.of();

        Set<Long> validProjectIds = projects.stream().map(Project::getId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> validCategoryIds = categories.stream().map(Category::getId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> validMemberUserIds = members.stream()
                .filter(m -> m.getUser() != null && m.getUser().getId() != null)
                .map(m -> m.getUser().getId())
                .collect(Collectors.toSet());

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Você é o assistente inteligente do BeeTask (sistema de gestão de tarefas corporativas).\n");
        promptBuilder.append("Sua função é interpretar a instrução em linguagem natural e extrair dados estruturados para preencher uma nova tarefa.\n\n");
        promptBuilder.append("Você DEVE responder EXCLUSIVAMENTE um objeto JSON válido no seguinte formato:\n");
        promptBuilder.append("{\n");
        promptBuilder.append("  \"title\": \"Título limpo, claro e conciso da tarefa (máximo 100 caracteres)\",\n");
        promptBuilder.append("  \"description\": \"Descrição detalhada com escopo e checklist de critérios de aceitação se aplicável\",\n");
        promptBuilder.append("  \"projectId\": <ID numérico do projeto correspondente ou null>,\n");
        promptBuilder.append("  \"categoryId\": <ID numérico da categoria correspondente ou null>,\n");
        promptBuilder.append("  \"assigneeUserId\": <ID numérico do membro responsável citado ou null>\n");
        promptBuilder.append("}\n\n");

        promptBuilder.append("Contexto disponível na organização:\n");
        promptBuilder.append("Projetos:\n");
        if (projects.isEmpty()) {
            promptBuilder.append("  (Nenhum projeto cadastrado)\n");
        } else {
            for (Project p : projects) {
                promptBuilder.append(String.format("  - ID %d: %s\n", p.getId(), p.getName()));
            }
        }

        promptBuilder.append("Categorias:\n");
        if (categories.isEmpty()) {
            promptBuilder.append("  (Nenhuma categoria cadastrada)\n");
        } else {
            for (Category c : categories) {
                promptBuilder.append(String.format("  - ID %d: %s\n", c.getId(), c.getName()));
            }
        }

        promptBuilder.append("Membros disponíveis:\n");
        if (members.isEmpty()) {
            promptBuilder.append("  (Nenhum membro cadastrado)\n");
        } else {
            for (UserOrganization m : members) {
                if (m.getUser() != null) {
                    promptBuilder.append(String.format("  - ID %d: %s (%s)\n",
                            m.getUser().getId(),
                            m.getUser().getName() != null ? m.getUser().getName() : "Sem nome",
                            m.getUser().getEmail() != null ? m.getUser().getEmail() : ""));
                }
            }
        }

        promptBuilder.append("\nRegras mandatórias:\n");
        promptBuilder.append("1. Apenas retorne IDs numéricos que estejam explicitamente listados acima. Caso não encontre correspondência direta, use null.\n");
        promptBuilder.append("2. Se a instrução do usuário contiver itens ou passos, formate a descrição com marcadores Markdown ou critérios de aceite.\n");
        promptBuilder.append("3. Não inclua texto antes ou depois do JSON.");

        String rawJson = ollamaService != null
                ? ollamaService.chat(promptBuilder.toString(), input.prompt(), true)
                : null;

        if (rawJson != null && !rawJson.isBlank()) {
            try {
                JsonNode node = objectMapper.readTree(rawJson);
                String title = node.path("title").asText("").trim();
                if (title.isBlank()) {
                    title = input.prompt().trim();
                }
                String description = node.path("description").asText("").trim();

                Long projectId = node.hasNonNull("projectId") ? node.path("projectId").asLong() : null;
                if (projectId != null && !validProjectIds.contains(projectId)) {
                    LOGGER.infof("AI sugeriu projectId %d inválido para a org, descartando...", projectId);
                    projectId = null;
                }

                Long categoryId = node.hasNonNull("categoryId") ? node.path("categoryId").asLong() : null;
                if (categoryId != null && !validCategoryIds.contains(categoryId)) {
                    LOGGER.infof("AI sugeriu categoryId %d inválido para a org, descartando...", categoryId);
                    categoryId = null;
                }

                Long assigneeUserId = node.hasNonNull("assigneeUserId") ? node.path("assigneeUserId").asLong() : null;
                if (assigneeUserId != null && !validMemberUserIds.contains(assigneeUserId)) {
                    LOGGER.infof("AI sugeriu assigneeUserId %d inválido para a org, descartando...", assigneeUserId);
                    assigneeUserId = null;
                }

                return new ParsedTaskOutput(
                        title,
                        description,
                        projectId,
                        categoryId,
                        assigneeUserId,
                        "NOT_STARTED"
                );
            } catch (Exception e) {
                LOGGER.warnf("Falha ao analisar JSON retornado pelo Ollama (%s): %s", rawJson, e.getMessage());
            }
        }

        // Fallback defensivo: se a IA estiver offline ou não retornar JSON válido
        return new ParsedTaskOutput(
                input.prompt().trim(),
                "",
                null,
                null,
                null,
                "NOT_STARTED"
        );
    }
}

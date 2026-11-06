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

import java.text.Normalizer;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

public class ParseTaskWithAiUseCase {
    private static final Logger LOGGER = Logger.getLogger(ParseTaskWithAiUseCase.class);

    private static final Pattern URL_PATTERN = Pattern.compile(
            "https?://[a-zA-Z0-9\\-._~:/?#\\[\\]@!$&'()*+,;=%]+",
            Pattern.CASE_INSENSITIVE
    );

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
        promptBuilder.append("  \"assigneeUserId\": <ID numérico do membro responsável citado ou null>,\n");
        promptBuilder.append("  \"externalUrl\": <URL completa se citada no texto (ex: https://github.com/..., https://jira...., Figma, PR, issue) ou null>\n");
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

        promptBuilder.append("Membros disponíveis (use o ID correspondente se o membro for citado pelo nome ou email):\n");
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
        promptBuilder.append("1. Apenas retorne IDs numéricos (projectId, categoryId, assigneeUserId) que estejam explicitamente listados acima. Se um membro for citado por nome ou email (mesmo primeiro nome), retorne o ID numérico desse membro. Caso não encontre correspondência direta, use null.\n");
        promptBuilder.append("2. Se houver qualquer link ou URL mencionado na instrução, capture a URL completa no campo externalUrl.\n");
        promptBuilder.append("3. Se a instrução do usuário contiver itens ou passos, formate a descrição com marcadores Markdown ou critérios de aceite.\n");
        promptBuilder.append("4. Não inclua texto antes ou depois do JSON.");

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

                Long assigneeUserId = resolveAssignee(node, input.prompt(), members, validMemberUserIds);
                String externalUrl = extractExternalUrl(node, input.prompt());

                return new ParsedTaskOutput(
                        title,
                        description,
                        projectId,
                        categoryId,
                        assigneeUserId,
                        externalUrl,
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
                resolveAssignee(null, input.prompt(), members, validMemberUserIds),
                extractExternalUrl(null, input.prompt()),
                "NOT_STARTED"
        );
    }

    private Long resolveAssignee(JsonNode node, String prompt, List<UserOrganization> members, Set<Long> validMemberUserIds) {
        // 1. Verificação direta de assigneeUserId
        if (node != null && node.hasNonNull("assigneeUserId")) {
            JsonNode aNode = node.path("assigneeUserId");
            if (aNode.isNumber()) {
                long id = aNode.asLong();
                if (validMemberUserIds.contains(id)) {
                    return id;
                }
            } else if (aNode.isTextual()) {
                String text = aNode.asText("").trim();
                try {
                    long id = Long.parseLong(text);
                    if (validMemberUserIds.contains(id)) {
                        return id;
                    }
                } catch (NumberFormatException ignored) {
                    Long matched = matchMemberByNameOrEmail(text, members);
                    if (matched != null) {
                        return matched;
                    }
                }
            }
        }

        // 2. Verificação de campos alternativos que a IA possa ter retornado
        if (node != null) {
            for (String field : List.of("assignee", "assigneeName", "responsible", "user")) {
                if (node.hasNonNull(field)) {
                    String name = node.path(field).asText("").trim();
                    if (!name.isBlank()) {
                        Long matched = matchMemberByNameOrEmail(name, members);
                        if (matched != null) {
                            return matched;
                        }
                    }
                }
            }
        }

        // 3. Fallback inteligente: buscar correspondência de membro diretamente no prompt
        return matchMemberInText(prompt, members);
    }

    private Long matchMemberByNameOrEmail(String text, List<UserOrganization> members) {
        if (text == null || text.isBlank() || members == null) {
            return null;
        }
        String cleanTarget = normalize(text);

        // Correspondência exata por e-mail ou prefixo do e-mail
        for (UserOrganization m : members) {
            if (m.getUser() == null || m.getUser().getId() == null) continue;
            String email = m.getUser().getEmail();
            if (email != null && !email.isBlank()) {
                String normEmail = normalize(email);
                if (normEmail.equalsIgnoreCase(cleanTarget)) {
                    return m.getUser().getId();
                }
                String username = normEmail.split("@")[0];
                if (username.equalsIgnoreCase(cleanTarget)) {
                    return m.getUser().getId();
                }
            }
        }

        // Correspondência exata por nome completo
        for (UserOrganization m : members) {
            if (m.getUser() == null || m.getUser().getId() == null) continue;
            String name = m.getUser().getName();
            if (name != null && !name.isBlank()) {
                String normName = normalize(name);
                if (normName.equalsIgnoreCase(cleanTarget)) {
                    return m.getUser().getId();
                }
            }
        }

        // Correspondência por primeiro nome (se comprimento >= 3 e não ambíguo)
        Long matchedId = null;
        int matchCount = 0;
        for (UserOrganization m : members) {
            if (m.getUser() == null || m.getUser().getId() == null) continue;
            String name = m.getUser().getName();
            if (name != null && !name.isBlank()) {
                String normName = normalize(name);
                String firstName = normName.split("\\s+")[0];
                if (firstName.equalsIgnoreCase(cleanTarget) && firstName.length() >= 3) {
                    matchedId = m.getUser().getId();
                    matchCount++;
                }
            }
        }
        if (matchCount == 1) {
            return matchedId;
        }

        return null;
    }

    private Long matchMemberInText(String prompt, List<UserOrganization> members) {
        if (prompt == null || prompt.isBlank() || members == null) {
            return null;
        }
        String normPrompt = normalize(prompt);

        // 1. Nomes completos primeiro (ordenados por tamanho decrescente)
        List<UserOrganization> sortedMembers = members.stream()
                .filter(m -> m.getUser() != null && m.getUser().getId() != null && m.getUser().getName() != null)
                .sorted((a, b) -> Integer.compare(b.getUser().getName().length(), a.getUser().getName().length()))
                .toList();

        for (UserOrganization m : sortedMembers) {
            String normName = normalize(m.getUser().getName());
            if (normName.length() >= 3 && containsWordOrPhrase(normPrompt, normName)) {
                return m.getUser().getId();
            }
        }

        // 2. E-mails citados no texto
        for (UserOrganization m : members) {
            if (m.getUser() == null || m.getUser().getId() == null) continue;
            String email = m.getUser().getEmail();
            if (email != null && !email.isBlank()) {
                String normEmail = normalize(email);
                if (containsWordOrPhrase(normPrompt, normEmail)) {
                    return m.getUser().getId();
                }
            }
        }

        // 3. Primeiro nome no texto (não ambíguo)
        Long matchedId = null;
        int matchCount = 0;
        for (UserOrganization m : members) {
            if (m.getUser() == null || m.getUser().getId() == null) continue;
            String name = m.getUser().getName();
            if (name != null && !name.isBlank()) {
                String normName = normalize(name);
                String firstName = normName.split("\\s+")[0];
                if (firstName.length() >= 3 && containsWordOrPhrase(normPrompt, firstName)) {
                    matchedId = m.getUser().getId();
                    matchCount++;
                }
            }
        }
        if (matchCount == 1) {
            return matchedId;
        }

        return null;
    }

    private String extractExternalUrl(JsonNode node, String prompt) {
        if (node != null && node.hasNonNull("externalUrl")) {
            String url = node.path("externalUrl").asText("").trim();
            if (!url.isBlank()) {
                if (url.startsWith("http://") || url.startsWith("https://")) {
                    return url;
                } else if (url.startsWith("www.") || url.contains(".com") || url.contains(".org") || url.contains(".dev") || url.contains(".io") || url.contains(".net")) {
                    return "https://" + url;
                }
            }
        }
        // Fallback: extrair URL diretamente do prompt via regex
        if (prompt != null) {
            Matcher matcher = URL_PATTERN.matcher(prompt);
            if (matcher.find()) {
                return matcher.group().replaceAll("[.,;)]+$", "").trim();
            }
        }
        return null;
    }

    private boolean containsWordOrPhrase(String text, String target) {
        String escaped = Pattern.quote(target);
        Pattern p = Pattern.compile("(?<!\\p{L})" + escaped + "(?!\\p{L})", Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE);
        return p.matcher(text).find();
    }

    private String normalize(String str) {
        if (str == null) return "";
        return Normalizer.normalize(str.trim().toLowerCase(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
    }
}

package net.beetechgroup.beetask.usecase.task.ai;

import net.beetechgroup.beetask.entities.Category;
import net.beetechgroup.beetask.entities.Project;
import net.beetechgroup.beetask.frameworks.ai.OllamaService;
import net.beetechgroup.beetask.usecase.organization.auth.AuthorizeOrganizationMemberUseCase;
import net.beetechgroup.beetask.usecase.repository.CategoryRepository;
import net.beetechgroup.beetask.usecase.repository.ProjectRepository;
import org.jboss.logging.Logger;

public class EnrichTaskDescriptionUseCase {
    private static final Logger LOGGER = Logger.getLogger(EnrichTaskDescriptionUseCase.class);

    private final OllamaService ollamaService;
    private final ProjectRepository projectRepository;
    private final CategoryRepository categoryRepository;
    private final AuthorizeOrganizationMemberUseCase authorizer;

    public EnrichTaskDescriptionUseCase(
            OllamaService ollamaService,
            ProjectRepository projectRepository,
            CategoryRepository categoryRepository,
            AuthorizeOrganizationMemberUseCase authorizer
    ) {
        this.ollamaService = ollamaService;
        this.projectRepository = projectRepository;
        this.categoryRepository = categoryRepository;
        this.authorizer = authorizer;
    }

    public EnrichTaskDescriptionOutput execute(EnrichTaskDescriptionInput input) {
        if (input.title() == null || input.title().isBlank()) {
            throw new IllegalArgumentException("O título da tarefa é obrigatório para gerar ou enriquecer a descrição.");
        }

        authorizer.execute(input.userEmail(), input.organizationId());

        String projectName = null;
        if (input.projectId() != null) {
            projectName = projectRepository.findProjectById(input.projectId())
                    .map(Project::getName)
                    .orElse(null);
        }

        String categoryName = null;
        if (input.categoryId() != null) {
            categoryName = categoryRepository.findCategoryById(input.categoryId())
                    .map(Category::getName)
                    .orElse(null);
        }

        StringBuilder systemPrompt = new StringBuilder();
        systemPrompt.append("Você é um especialista em engenharia de software e gestão ágil de projetos.\n");
        systemPrompt.append("Sua missão é gerar uma descrição detalhada, clara e profissional em formato Markdown para uma tarefa de trabalho.\n\n");
        systemPrompt.append("Estruture a descrição OBRIGATORIAMENTE no seguinte padrão:\n");
        systemPrompt.append("### Contexto e Objetivo\n");
        systemPrompt.append("(Explique de forma objetiva o que motivou a tarefa e a meta principal)\n\n");
        systemPrompt.append("### Escopo de Execução\n");
        systemPrompt.append("(Detalhe os passos e o que precisa ser desenvolvido ou executado)\n\n");
        systemPrompt.append("### Critérios de Aceitação\n");
        systemPrompt.append("- [ ] Critério 1 verificável\n");
        systemPrompt.append("- [ ] Critério 2 verificável\n");
        systemPrompt.append("- [ ] Critério 3 verificável\n\n");
        systemPrompt.append("IMPORTANTE:\n");
        systemPrompt.append("- Responda APENAS com o texto Markdown da descrição. Não inclua saudações, introduções ('Aqui está...') ou blocos de código delimitadores ```markdown no início ou fim.\n");
        systemPrompt.append("- Use tom profissional e direto em português brasileiro.");

        StringBuilder userPrompt = new StringBuilder();
        userPrompt.append(String.format("Título da Tarefa: %s\n", input.title().trim()));
        if (projectName != null) {
            userPrompt.append(String.format("Projeto: %s\n", projectName));
        }
        if (categoryName != null) {
            userPrompt.append(String.format("Categoria: %s\n", categoryName));
        }
        if (input.currentDescription() != null && !input.currentDescription().isBlank()) {
            userPrompt.append(String.format("\nAnotações / Rascunho inicial do usuário:\n%s\n", input.currentDescription().trim()));
        }

        String enriched = ollamaService != null
                ? ollamaService.chat(systemPrompt.toString(), userPrompt.toString(), false)
                : null;

        if (enriched == null || enriched.isBlank()) {
            String fallback = input.currentDescription() != null && !input.currentDescription().isBlank()
                    ? input.currentDescription()
                    : "Não foi possível enriquecer a descrição com a IA no momento.";
            return new EnrichTaskDescriptionOutput(fallback);
        }

        // Limpeza defensiva caso o modelo coloque ```markdown no início ou fim
        String cleaned = enriched.replaceAll("^```markdown\\s*", "")
                .replaceAll("^```\\s*", "")
                .replaceAll("\\s*```$", "")
                .trim();

        return new EnrichTaskDescriptionOutput(cleaned);
    }
}

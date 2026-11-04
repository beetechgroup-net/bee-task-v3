package net.beetechgroup.beetask.frameworks.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class OllamaService {
    private static final Logger LOGGER = Logger.getLogger(OllamaService.class);

    @ConfigProperty(name = "app.ollama.endpoint", defaultValue = "http://beea-ollama:11434")
    String endpoint;

    @ConfigProperty(name = "app.ollama.model", defaultValue = "qwen3.5:0.8b")
    String model;

    @ConfigProperty(name = "app.ollama.timeout-seconds", defaultValue = "45")
    int timeoutSeconds;

    @Inject
    ObjectMapper objectMapper;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public String chat(String systemPrompt, String userPrompt, boolean jsonFormat) {
        if (userPrompt == null || userPrompt.isBlank()) {
            return null;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", model);
            payload.put("stream", false);
            payload.put("think", false);
            if (jsonFormat) {
                payload.put("format", "json");
            }

            List<Map<String, String>> messages = new java.util.ArrayList<>();
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                messages.add(Map.of("role", "system", "content", systemPrompt));
            }
            messages.add(Map.of("role", "user", "content", userPrompt));
            payload.put("messages", messages);

            Map<String, Object> options = Map.of(
                    "num_ctx", 4096,
                    "temperature", 0.2
            );
            payload.put("options", options);

            String requestBody = objectMapper.writeValueAsString(payload);
            String url = endpoint.replaceAll("/+$", "") + "/api/chat";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            LOGGER.infof("Enviando requisição para Ollama (%s) no modelo %s...", url, model);
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                String content = root.path("message").path("content").asText("");

                // Sanitização defensiva caso o modelo emita tags de pensamento
                String sanitized = content.replaceAll("(?s)<think>.*?</think>", "").trim();
                if (sanitized.startsWith("Thinking Process:")) {
                    sanitized = sanitized.substring(sanitized.indexOf("\n\n") + 2).trim();
                }

                LOGGER.infof("Resposta da IA gerada com sucesso pelo Ollama (%d caracteres)", sanitized.length());
                return sanitized;
            } else {
                LOGGER.warnf("Ollama retornou status HTTP %d: %s", response.statusCode(), response.body());
                return null;
            }
        } catch (Exception e) {
            LOGGER.warnf("Erro ao conectar ou processar requisição no Ollama: %s", e.getMessage());
            return null;
        }
    }

    public String generateSummary(String systemPrompt, String tasksContext) {
        if (tasksContext == null || tasksContext.isBlank()) {
            return "Nenhuma atividade registrada no período para resumo.";
        }

        String effectiveSystemPrompt = (systemPrompt != null && !systemPrompt.isBlank())
                ? systemPrompt
                : "Você é um assistente corporativo. Com base na lista de tarefas realizadas pelo colaborador abaixo, elabore um resumo conciso e profissional em um ou dois parágrafos destacando as principais entregas.";

        String result = chat(effectiveSystemPrompt, tasksContext, false);
        return result != null ? result : "Não foi possível gerar o resumo com IA neste momento.";
    }
}

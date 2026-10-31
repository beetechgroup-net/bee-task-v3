package net.beetechgroup.beetask.interfaceadapters.controllers.report;

import java.io.FileInputStream;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.beetechgroup.beetask.entities.report.GeneratedReport;
import net.beetechgroup.beetask.usecase.report.ReportTemplateOutput;
import net.beetechgroup.beetask.usecase.report.create.CreateReportTemplateInput;
import net.beetechgroup.beetask.usecase.report.create.CreateReportTemplateUseCase;
import net.beetechgroup.beetask.usecase.report.delete.DeleteReportTemplateUseCase;
import net.beetechgroup.beetask.usecase.report.generate.GenerateReportInput;
import net.beetechgroup.beetask.usecase.report.generate.GenerateReportOutput;
import net.beetechgroup.beetask.usecase.report.generate.GenerateReportUseCase;
import net.beetechgroup.beetask.usecase.report.list.ListGeneratedReportsUseCase;
import net.beetechgroup.beetask.usecase.report.list.ListReportTemplatesUseCase;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;
import org.jboss.resteasy.reactive.MultipartForm;

@Path("/organizations/{orgId}/reports")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
@Tag(name = "Reports", description = "Operations for generating reports and managing report templates")
public class ReportController {
    private static final Logger LOGGER = Logger.getLogger(ReportController.class);

    @Inject
    CreateReportTemplateUseCase createReportTemplateUseCase;

    @Inject
    ListReportTemplatesUseCase listReportTemplatesUseCase;

    @Inject
    DeleteReportTemplateUseCase deleteReportTemplateUseCase;

    @Inject
    GenerateReportUseCase generateReportUseCase;

    @Inject
    ListGeneratedReportsUseCase listGeneratedReportsUseCase;

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    ObjectMapper objectMapper;

    @GET
    @Path("/templates")
    @Operation(summary = "List report templates", description = "Lists all templates for the given organization and optional project")
    public List<ReportTemplateOutput> listTemplates(
            @PathParam("orgId") Long orgId,
            @QueryParam("projectId") Long projectId
    ) {
        String email = securityIdentity.getPrincipal().getName();
        return listReportTemplatesUseCase.execute(email, orgId, projectId);
    }

    @POST
    @Path("/templates")
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Operation(summary = "Create report template", description = "Uploads a .docx template and configures sections")
    public ReportTemplateOutput createTemplate(
            @PathParam("orgId") Long orgId,
            @MultipartForm CreateReportTemplateForm form
    ) {
        String email = securityIdentity.getPrincipal().getName();

        if (form.file == null || form.file.filePath() == null) {
            throw new IllegalArgumentException("Arquivo .docx de modelo é obrigatório");
        }

        List<CreateReportTemplateInput.SectionInput> sections = new ArrayList<>();
        if (form.sectionsJson != null && !form.sectionsJson.isBlank()) {
            try {
                sections = objectMapper.readValue(form.sectionsJson, new TypeReference<List<CreateReportTemplateInput.SectionInput>>() {});
            } catch (Exception e) {
                LOGGER.warnf("Falha ao parsear sectionsJson: %s", e.getMessage());
            }
        }

        try (InputStream is = new FileInputStream(form.file.filePath().toFile())) {
            CreateReportTemplateInput input = new CreateReportTemplateInput(
                    email,
                    orgId,
                    form.projectId,
                    form.name,
                    form.description,
                    form.scope,
                    form.file.fileName(),
                    is,
                    form.file.size(),
                    sections
            );
            return createReportTemplateUseCase.execute(input);
        } catch (Exception e) {
            LOGGER.errorf("Erro ao processar template: %s", e.getMessage());
            throw new RuntimeException("Erro ao processar arquivo de template: " + e.getMessage(), e);
        }
    }

    @DELETE
    @Path("/templates/{templateId}")
    @Operation(summary = "Delete report template", description = "Deletes a report template by ID")
    public Response deleteTemplate(
            @PathParam("orgId") Long orgId,
            @PathParam("templateId") Long templateId
    ) {
        String email = securityIdentity.getPrincipal().getName();
        deleteReportTemplateUseCase.execute(email, templateId);
        return Response.noContent().build();
    }

    @POST
    @Path("/generate")
    @Operation(summary = "Generate filled report", description = "Generates a .docx report for the period and user")
    public Response generateReport(
            @PathParam("orgId") Long orgId,
            GenerateReportRequest req
    ) {
        String email = securityIdentity.getPrincipal().getName();

        GenerateReportInput input = new GenerateReportInput(
                email,
                orgId,
                req.templateId,
                req.projectId,
                req.startDate,
                req.endDate,
                req.customFields
        );

        GenerateReportOutput output = generateReportUseCase.execute(input);

        String encodedFileName = URLEncoder.encode(output.fileName(), StandardCharsets.UTF_8).replace("+", "%20");

        return Response.ok(output.docxBytes())
                .type(output.contentType())
                .header("Content-Disposition", "attachment; filename=\"" + output.fileName() + "\"; filename*=UTF-8''" + encodedFileName)
                .header("X-Report-Id", String.valueOf(output.generatedReportId()))
                .header("X-Report-Url", output.fileUrl())
                .build();
    }

    @GET
    @Path("/history")
    @Operation(summary = "List generated reports history", description = "Lists reports generated in this organization")
    public List<GeneratedReport> listHistory(@PathParam("orgId") Long orgId) {
        String email = securityIdentity.getPrincipal().getName();
        return listGeneratedReportsUseCase.execute(email, orgId);
    }
}

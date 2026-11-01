package net.beetechgroup.beetask.interfaceadapters.controllers.user;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.beetechgroup.beetask.entities.UserSignature;
import net.beetechgroup.beetask.usecase.user.signature.CreateUserSignatureInput;
import net.beetechgroup.beetask.usecase.user.signature.CreateUserSignatureUseCase;
import net.beetechgroup.beetask.usecase.user.signature.DeleteUserSignatureUseCase;
import net.beetechgroup.beetask.usecase.user.signature.ListUserSignaturesUseCase;
import net.beetechgroup.beetask.usecase.user.signature.SetDefaultUserSignatureUseCase;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import org.jboss.logging.Logger;

import java.nio.file.Files;
import java.util.Base64;
import java.util.List;

@Path("/auth/profile/signatures")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
@Tag(name = "User Signatures", description = "Gerenciamento de assinaturas digitais do usuário")
public class UserSignatureController {
    private static final Logger LOGGER = Logger.getLogger(UserSignatureController.class);

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    ListUserSignaturesUseCase listUserSignaturesUseCase;

    @Inject
    CreateUserSignatureUseCase createUserSignatureUseCase;

    @Inject
    SetDefaultUserSignatureUseCase setDefaultUserSignatureUseCase;

    @Inject
    DeleteUserSignatureUseCase deleteUserSignatureUseCase;

    @GET
    @Operation(summary = "Listar assinaturas do usuário autenticado")
    public List<UserSignatureResponse> listSignatures() {
        String email = securityIdentity.getPrincipal().getName();
        return listUserSignaturesUseCase.execute(email).stream()
                .map(UserSignatureResponse::from)
                .toList();
    }

    @POST
    @Consumes(MediaType.MULTIPART_FORM_DATA)
    @Operation(summary = "Cadastrar nova assinatura digital")
    public Response createSignature(CreateSignatureForm form) {
        String email = securityIdentity.getPrincipal().getName();

        byte[] imageBytes = null;
        String contentType = "image/png";

        if (form.file != null && form.file.filePath() != null) {
            try {
                imageBytes = Files.readAllBytes(form.file.filePath());
                if (form.file.contentType() != null && !form.file.contentType().isBlank()) {
                    contentType = form.file.contentType();
                }
            } catch (Exception e) {
                LOGGER.errorf("Erro ao ler arquivo da assinatura: %s", e.getMessage());
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\": \"Falha ao ler o arquivo enviado.\"}")
                        .build();
            }
        } else if (form.imageBase64 != null && !form.imageBase64.isBlank()) {
            try {
                String raw = form.imageBase64.trim();
                if (raw.contains(",")) {
                    String header = raw.substring(0, raw.indexOf(","));
                    if (header.contains("image/jpeg") || header.contains("image/jpg")) {
                        contentType = "image/jpeg";
                    } else if (header.contains("image/webp")) {
                        contentType = "image/webp";
                    }
                    raw = raw.substring(raw.indexOf(",") + 1);
                }
                imageBytes = Base64.getDecoder().decode(raw);
            } catch (Exception e) {
                LOGGER.errorf("Erro ao decodificar imagem base64: %s", e.getMessage());
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\": \"Dados de imagem base64 inválidos.\"}")
                        .build();
            }
        }

        if (imageBytes == null || imageBytes.length == 0) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"A imagem da assinatura é obrigatória.\"}")
                    .build();
        }

        CreateUserSignatureInput input = new CreateUserSignatureInput(
                email,
                form.name,
                form.signatureType,
                form.isDefault,
                imageBytes,
                contentType
        );

        UserSignature created = createUserSignatureUseCase.execute(input);
        return Response.status(Response.Status.CREATED)
                .entity(UserSignatureResponse.from(created))
                .build();
    }

    @PUT
    @Path("/{id}/default")
    @Operation(summary = "Definir assinatura como padrão")
    public Response setDefault(@PathParam("id") Long id) {
        String email = securityIdentity.getPrincipal().getName();
        UserSignature signature = setDefaultUserSignatureUseCase.execute(id, email);
        return Response.ok(UserSignatureResponse.from(signature)).build();
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Excluir assinatura")
    public Response delete(@PathParam("id") Long id) {
        String email = securityIdentity.getPrincipal().getName();
        deleteUserSignatureUseCase.execute(id, email);
        return Response.noContent().build();
    }
}

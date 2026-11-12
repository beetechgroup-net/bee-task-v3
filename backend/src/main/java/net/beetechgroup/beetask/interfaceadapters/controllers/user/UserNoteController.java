package net.beetechgroup.beetask.interfaceadapters.controllers.user;

import io.quarkus.security.Authenticated;
import io.quarkus.security.identity.SecurityIdentity;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import net.beetechgroup.beetask.entities.UserNote;
import net.beetechgroup.beetask.usecase.user.note.GetUserNoteUseCase;
import net.beetechgroup.beetask.usecase.user.note.SaveUserNoteUseCase;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/notes")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
@Tag(name = "Notes", description = "Bloco de notas pessoal do usuário")
public class UserNoteController {

    @Inject
    SecurityIdentity securityIdentity;

    @Inject
    GetUserNoteUseCase getUserNoteUseCase;

    @Inject
    SaveUserNoteUseCase saveUserNoteUseCase;

    @GET
    @Operation(summary = "Obter nota do usuário autenticado")
    public Response getNote() {
        String email = securityIdentity.getPrincipal().getName();
        UserNote note = getUserNoteUseCase.execute(email);
        return Response.ok(UserNoteResponse.from(note)).build();
    }

    @PUT
    @Operation(summary = "Salvar ou atualizar nota do usuário autenticado")
    public Response saveNote(SaveUserNoteRequest request) {
        String email = securityIdentity.getPrincipal().getName();
        String content = request != null && request.getContent() != null ? request.getContent() : "";
        UserNote saved = saveUserNoteUseCase.execute(email, content);
        return Response.ok(UserNoteResponse.from(saved)).build();
    }
}

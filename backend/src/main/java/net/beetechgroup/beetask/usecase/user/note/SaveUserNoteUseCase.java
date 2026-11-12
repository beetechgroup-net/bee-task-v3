package net.beetechgroup.beetask.usecase.user.note;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.UserNote;
import net.beetechgroup.beetask.usecase.exceptions.UserNotFoundException;
import net.beetechgroup.beetask.usecase.repository.UserNoteRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

public class SaveUserNoteUseCase {

    private final UserRepository userRepository;
    private final UserNoteRepository userNoteRepository;

    public SaveUserNoteUseCase(UserRepository userRepository, UserNoteRepository userNoteRepository) {
        this.userRepository = userRepository;
        this.userNoteRepository = userNoteRepository;
    }

    public UserNote execute(String userEmail, String content) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado: " + userEmail));

        UserNote note = new UserNote();
        note.setUserId(user.getId());
        note.setContent(content != null ? content : "");

        return userNoteRepository.save(note);
    }
}

package net.beetechgroup.beetask.usecase.user.note;

import net.beetechgroup.beetask.entities.User;
import net.beetechgroup.beetask.entities.UserNote;
import net.beetechgroup.beetask.usecase.exceptions.UserNotFoundException;
import net.beetechgroup.beetask.usecase.repository.UserNoteRepository;
import net.beetechgroup.beetask.usecase.repository.UserRepository;

public class GetUserNoteUseCase {

    private final UserRepository userRepository;
    private final UserNoteRepository userNoteRepository;

    public GetUserNoteUseCase(UserRepository userRepository, UserNoteRepository userNoteRepository) {
        this.userRepository = userRepository;
        this.userNoteRepository = userNoteRepository;
    }

    public UserNote execute(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UserNotFoundException("Usuário não encontrado: " + userEmail));

        return userNoteRepository.findByUserId(user.getId())
                .orElseGet(() -> new UserNote(null, user.getId(), "", null, null));
    }
}

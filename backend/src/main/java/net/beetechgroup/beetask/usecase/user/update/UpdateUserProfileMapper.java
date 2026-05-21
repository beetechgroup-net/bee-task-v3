package net.beetechgroup.beetask.usecase.user.update;

import net.beetechgroup.beetask.entities.User;

import java.util.Objects;

public class UpdateUserProfileMapper {

    public static UpdateUserProfileOutput toOutput(User user) {
        String photo = Objects.nonNull(user.getPhoto())
                ? user.getPhoto()
                : "https://ui-avatars.com/api/?name=" + user.getName().replace(" ", "+") + "&background=random";
        return new UpdateUserProfileOutput(user.getName(), user.getEmail(), photo);
    }
}

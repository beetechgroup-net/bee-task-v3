package net.beetechgroup.beetask.usecase.user.update;

import net.beetechgroup.beetask.entities.User;

public class UpdateUserProfileMapper {

    public static UpdateUserProfileOutput toOutput(User user) {
        return new UpdateUserProfileOutput(user.getName(), user.getEmail(), user.getPhoto());
    }
}

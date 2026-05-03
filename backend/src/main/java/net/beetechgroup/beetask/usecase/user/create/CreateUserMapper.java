package net.beetechgroup.beetask.usecase.user.create;

import net.beetechgroup.beetask.entities.User;

public class CreateUserMapper {

    public static User toUser(CreateUserInput input) {
        User user = new User();
        user.setName(input.name());
        user.setEmail(input.email());
        user.setPassword(input.password());
        return user;
    }

    public static CreateUserOutput toCreateUserOutput(User user) {
        return new CreateUserOutput(user.getId(), user.getName(), user.getEmail());
    }
}

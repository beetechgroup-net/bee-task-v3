package net.beetechgroup.beetask.usecase.auth.login;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}

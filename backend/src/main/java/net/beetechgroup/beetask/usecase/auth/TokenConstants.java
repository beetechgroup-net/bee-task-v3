package net.beetechgroup.beetask.usecase.auth;

public final class TokenConstants {

    public static final long ACCESS_TOKEN_EXPIRY_SECONDS = 3600L;   // 1 hour
    public static final long REFRESH_TOKEN_EXPIRY_SECONDS = 86400L; // 24 hours

    private TokenConstants() {}
}

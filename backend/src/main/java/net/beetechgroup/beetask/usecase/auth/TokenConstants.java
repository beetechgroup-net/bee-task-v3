package net.beetechgroup.beetask.usecase.auth;

public final class TokenConstants {

    public static final long ACCESS_TOKEN_EXPIRY_SECONDS = 604800L;   // 7 days (1 week)
    public static final long REFRESH_TOKEN_EXPIRY_SECONDS = 2592000L; // 30 days

    private TokenConstants() {}
}

package net.beetechgroup.beetask.usecase.auth;

public final class TokenConstants {

    public static final long ACCESS_TOKEN_EXPIRY_SECONDS = 86400L;   // 24 hours
    public static final long REFRESH_TOKEN_EXPIRY_SECONDS = 604800L; // 7 days

    private TokenConstants() {}
}

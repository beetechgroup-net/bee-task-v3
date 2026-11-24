package net.beetechgroup.beetask.usecase.auth;

public final class TokenConstants {

    public static final long ACCESS_TOKEN_EXPIRY_SECONDS = 2592000L;  // 30 days
    public static final long REFRESH_TOKEN_EXPIRY_SECONDS = 5184000L; // 60 days

    private TokenConstants() {}
}

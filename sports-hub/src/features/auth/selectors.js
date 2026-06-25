export const selectAuth = (state) => state.auth;

export const selectUser = (state) => state.auth.user;

export const selectAccessToken = (state) => state.auth.accessToken;

export const selectAuthStatus = (state) => state.auth.status;

export const selectAuthError = (state) => state.auth.error;

export const selectIsAuthenticated = (state) => Boolean(state.auth.accessToken);

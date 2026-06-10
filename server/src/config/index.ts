export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-key',
  jwtExpiresInSeconds: parseInt(process.env.JWT_EXPIRES_IN_SECONDS || '86400', 10),
  refreshTokenExpiresInSeconds: parseInt(process.env.REFRESH_TOKEN_EXPIRES_IN_SECONDS || '604800', 10),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variable: ${name}`);
    }
    console.warn(`[config] ${name} not set, using default (not safe for production)`);
    return fallback || '';
  }
  return value;
}

export const config = {
  port: parseInt(getEnv('PORT', '3000'), 10),
  jwtSecret: getEnv('JWT_SECRET', 'dev-secret-key'),
  jwtExpiresInSeconds: parseInt(getEnv('JWT_EXPIRES_IN_SECONDS', '86400'), 10),
  refreshTokenExpiresInSeconds: parseInt(getEnv('REFRESH_TOKEN_EXPIRES_IN_SECONDS', '604800'), 10),
  corsOrigin: getEnv('CORS_ORIGIN', 'http://localhost:5173'),
  db: {
    host: getEnv('DB_HOST', 'localhost'),
    port: parseInt(getEnv('DB_PORT', '5432'), 10),
    database: getEnv('DB_NAME', 'gradebook'),
    user: getEnv('DB_USER', 'postgres'),
    password: getEnv('DB_PASSWORD', 'postgres'),
    poolMax: parseInt(getEnv('DB_POOL_MAX', '10'), 10),
    poolIdleTimeoutMs: parseInt(getEnv('DB_POOL_IDLE_TIMEOUT_MS', '10000'), 10),
    poolConnectionTimeoutMs: parseInt(getEnv('DB_POOL_CONNECTION_TIMEOUT_MS', '10000'), 10),
  },
};

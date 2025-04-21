export const LOGGER_CONSTANTS = {
  SENSITIVE_KEYS: ['password', 'token', 'authorization'], // 日志敏感词过滤
  ALLOWED_CATEGORIES: ['http', 'user'] as const satisfies readonly string[], //允许的日志目录
} as const;

const authMessages = {
  UNAUTH: '身份已过期，请重新登录',
};

export const API_MESSAGES_CONSTANTS = {
  ...authMessages,
} as const;

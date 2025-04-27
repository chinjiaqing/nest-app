const AUTH_MESSAGE = {
  UNAUTH: '身份已过期，请重新登录',
};

const ERR_MESSAGES = {
  BUSY: '服务器忙，请稍后再试',
  NOT_FOUNT: '请求的资源不存在',
};

export const API_MESSAGES_CONSTANTS = {
  ...AUTH_MESSAGE,
  ...ERR_MESSAGES,
} as const;

import * as fs from 'fs';
import * as path from 'path';

const ENV_NAMES = ['prod', 'test', 'local'] as const;

type EnvName = (typeof ENV_NAMES)[number];

export const isEnv = (name: EnvName) => {
  return process.env.NODE_ENV === name;
};

const envName: string = process.env.NODE_ENV || '';

export const isProdEnv = () => isEnv('prod');
export const isLocalEnv = () => isEnv('local');
export const isTestEnv = () => isEnv('test');

function getEnvFile() {
  if (!ENV_NAMES.includes(envName as EnvName)) {
    throw new Error(
      `当前的NODE_ENV: ${envName}不在支持的范围内：[${ENV_NAMES.join(',')}]`,
    );
  }
  const envFilePath = path.resolve(
    __dirname,
    `../../.env.${process.env.NODE_ENV}`,
  );
  if (!fs.existsSync(envFilePath)) {
    throw new Error(`缺少.env.${envName}* 配置文件`);
  }

  return {
    path: envFilePath,
  };
}

export const envFilePath = getEnvFile();

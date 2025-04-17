import * as fs from 'fs';
import * as path from 'path';

const isProdEnv = process.env.NODE_ENV === 'prod';

function getEnvFile() {
  const testEnvFile = path.resolve(__dirname, '../../.env.test');
  const prodEnvFile = path.resolve(__dirname, '../../.env.prod');

  if (!fs.existsSync(testEnvFile) || !fs.existsSync(prodEnvFile)) {
    throw new Error(`缺少.env.* 配置文件`);
  }

  const filePath = isProdEnv ? prodEnvFile : testEnvFile;

  return {
    path: filePath,
  };
}

export default getEnvFile();

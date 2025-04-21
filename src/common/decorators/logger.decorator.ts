import { Inject } from '@nestjs/common';
import { LogCategoryNameMap } from '../types';
import { generateLoggerToken } from '../utils/logger.utils';

export const InjectLogger = <T extends keyof LogCategoryNameMap>(category: T) =>
  Inject(generateLoggerToken(category));

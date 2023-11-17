import { Logger } from 'typeorm';

const noop = () => undefined;

export const noopLogger: Logger = {
  log: noop,
  logMigration: noop,
  logQuery: noop,
  logQueryError: noop,
  logQuerySlow: noop,
  logSchemaBuild: noop,
};

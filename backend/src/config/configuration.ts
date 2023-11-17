import migrations from '../migrations';
import { Env } from './interfaces';

const entities: never[] = [
  // TODO: add entities here
];

const configuration = () => ({
  dbConfig: {
    entities,
    migrations,
    type: 'postgres',
    url: process.env[Env.DATABASE_URL],
    // useUTC: true,
    synchronize: false,
    logging: ['error', 'warn', 'info'],
  },
});

export default configuration;

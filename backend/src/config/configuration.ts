import { Mentor } from '../mentors/mentor.entity';
import migrations from '../migrations';
import { Timeslot } from '../timeslots/timeslot.entity';
import { Env } from './interfaces';

const entities = [Mentor, Timeslot];

const configuration = () => ({
  dbConfig: {
    entities,
    migrations,
    type: 'postgres',
    url: process.env[Env.DATABASE_URL],
    // useUTC: true,
    synchronize: false,
    logging: 'all',
  },
});

export default configuration;

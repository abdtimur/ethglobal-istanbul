import { DataSource } from 'typeorm';

import migrations from './migrations';
import { Mentor } from './mentors/mentor.entity';
import { Timeslot } from './timeslots/timeslot.entity';

// to be used for local development and migrations
export default new DataSource({
  migrations,
  type: 'postgres',
  url: 'postgresql://emp-user:XXX@localhost:5432/ethglobal_ist',
  entities: [Mentor, Timeslot],
  logging: true,
});

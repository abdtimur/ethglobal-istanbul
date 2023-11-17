import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimeslotStatus } from './types';
import { Mentor } from '../mentors/mentor.entity';

@Entity()
export class Timeslot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: TimeslotStatus, default: TimeslotStatus.Free })
  status: TimeslotStatus;

  // Init data to provide:
  @Column('char', { length: 10, nullable: false }) // 2021-01-01
  date: string;

  @Column('char', { length: 5, nullable: false }) // 00:00
  time: string;

  @Column()
  price: string;

  @Column()
  currency: string;

  @Column()
  duration: number;

  // Once booked:

  @Column('varchar', { nullable: true })
  account: string | null;

  @Column('varchar', { nullable: true })
  txHash: string | null;

  @Column('varchar', { nullable: true })
  txCompletedHash: string | null;

  @Column({ type: 'numeric', scale: 0, precision: 78, nullable: true })
  txValue: string | null;

  @Column('varchar', { nullable: true })
  callInfo: string | null;

  // Timeslot owner:

  @ManyToOne(() => Mentor, (mentor) => mentor.timeslots)
  @JoinColumn({ name: 'mentorAccount' })
  mentor: Mentor;

  @Column('varchar')
  mentorAccount: string;

  constructor(data: Partial<Timeslot>) {
    Object.assign(this, data);
  }
}

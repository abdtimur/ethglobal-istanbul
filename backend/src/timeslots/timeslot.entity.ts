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

  @Column('char', { length: 10, nullable: false }) // 2021-01-01
  date: string;

  @Column('char', { length: 5, nullable: false }) // 00:00
  time: string;

  @Column()
  price: number;

  @Column()
  currency: string;

  @Column()
  duration: number;

  @ManyToOne(() => Mentor, (mentor) => mentor.timeslots)
  @JoinColumn({ name: 'mentorId' })
  mentor: Mentor;

  @Column('varchar')
  mentorId: string;
}

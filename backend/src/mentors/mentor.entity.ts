import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Timeslot } from '../timeslots/timeslot.entity';

@Entity()
export class Mentor {
  @PrimaryColumn() // address
  account: string;

  @PrimaryColumn({default: 11155111}) // chainId
  chainId: number;

  @Column('varchar', { nullable: true })
  displayName: string | null;

  @Column('varchar', { nullable: true })
  profilePhotoUrl: string | null;

  @Column('boolean', { default: false })
  tlsnVerified: boolean;

  @Column('boolean', { default: false })
  humanVerified: boolean;

  @Column('boolean', { default: false })
  polygonIdVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Timeslot, (timeslot) => timeslot.mentor)
  @JoinColumn({ referencedColumnName: 'mentorAccount' })
  timeslots: Timeslot[];
}

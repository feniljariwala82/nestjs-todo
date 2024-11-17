import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampEntity } from '../../config/base-entity';
import { TableNames } from '../../config/constants';
import { Task } from '../tasks/tasks.entity';

@Entity(TableNames.users)
export class User extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  first_name: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50, nullable: false })
  last_name: string;

  @Column({
    name: 'email',
    type: 'varchar',
    length: 100,
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({ name: 'password', type: 'varchar', nullable: false })
  password: string;

  /**
   * relationships
   */
  @OneToMany(() => Task, (Task) => Task.user)
  @JoinColumn([{ name: 'id', referencedColumnName: 'user_id' }])
  tasks: Task[];
}

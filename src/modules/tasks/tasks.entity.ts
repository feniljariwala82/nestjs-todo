import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TimestampEntity } from '../../config/base-entity';
import { TableNames } from '../../config/constants';
import { TaskPriority } from '../../migrations/1730282339113-tasks';
import { User } from '../users/users.entity';

@Entity(TableNames.tasks)
export class Task extends TimestampEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  title: string;

  @Column({ name: 'description', type: 'varchar', nullable: false })
  description: string;

  @Column({
    name: 'priority',
    type: 'varchar',
    length: 10,
    nullable: false,
    enum: [TaskPriority.high, TaskPriority.low, TaskPriority.medium],
    default: TaskPriority.low,
  })
  priority: string;

  @Column({
    name: 'user_id',
    type: 'integer',
    nullable: false,
  })
  user_id: number;

  /**
   * relationships
   */
  @ManyToOne(() => User, (user) => user.tasks)
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;
}

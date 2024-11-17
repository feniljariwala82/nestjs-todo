import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';
import { TableNames } from '../config/constants';

export enum TaskPriority {
  high = 'high',
  medium = 'medium',
  low = 'low',
}

export class Tasks1730282339113 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // creates table
    await queryRunner.createTable(
      new Table({
        name: TableNames.tasks,
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            generationStrategy: 'increment',
            isGenerated: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'priority',
            type: 'varchar',
            length: '10',
            isNullable: false,
            enum: [TaskPriority.high, TaskPriority.low, TaskPriority.medium],
          },
          {
            name: 'user_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'date',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'date',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    // creates foreign key constraints
    await queryRunner.createForeignKey(
      TableNames.tasks,
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: TableNames.users,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // drops foreign key constraints
    const table = await queryRunner.getTable(TableNames.tasks);

    // drops all the foreign key constraints
    await queryRunner.dropForeignKeys(TableNames.tasks, table.foreignKeys);

    // drops table
    await queryRunner.dropTable(TableNames.users, true);
  }
}

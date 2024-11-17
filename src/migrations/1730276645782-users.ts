import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { TableNames } from '../config/constants';

export class Users1730276645782 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // creates table
    await queryRunner.createTable(
      new Table({
        name: TableNames.users,
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            generationStrategy: 'increment',
            isGenerated: true,
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'email',
            type: 'varchar',
            length: '100',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'password',
            type: 'varchar',
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // drops table
    await queryRunner.dropTable(TableNames.users, true);
  }
}

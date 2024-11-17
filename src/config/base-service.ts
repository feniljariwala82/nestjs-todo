import { Injectable } from '@nestjs/common';
import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

@Injectable()
export class BaseService<Entity> {
  constructor(private readonly repository: Repository<Entity>) {}

  async findOneOrFail(options: FindOneOptions<Entity>): Promise<Entity> {
    return this.repository.findOneOrFail(options);
  }

  async findOne(options: FindOneOptions<Entity>): Promise<Entity | null> {
    return this.repository.findOne(options);
  }

  async find(options: FindManyOptions<Entity>): Promise<Entity[]> {
    return this.repository.find(options);
  }

  async create(payload: DeepPartial<Entity>): Promise<Entity> {
    const entity = this.repository.create(payload);
    return this.repository.save(entity);
  }

  async update(
    id: number,
    payload: QueryDeepPartialEntity<Entity>,
  ): Promise<Entity> {
    await this.repository.update(id, payload);
    return this.findOneOrFail({ where: { id } as any });
  }

  async delete(id: number): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(options: FindManyOptions<Entity>): Promise<boolean> {
    return this.repository.exists(options);
  }

  /**
   * Generates paginated response
   * @param perPage
   * @param currentPage
   * @param options
   */
  async paginatedQuery(
    perPage: number,
    currentPage: number,
    options?: FindManyOptions<Entity>,
  ): Promise<{
    currentPage: number;
    totalPages: number;
    perPage: number;
    totalItems: number;
    items: Entity[];
  }> {
    const [items, totalItems] = await Promise.all([
      this.repository.find({
        skip: (currentPage - 1) * perPage,
        ...options,
      }),
      this.repository.count(options),
    ]);

    return {
      currentPage,
      totalPages: Math.ceil(totalItems / perPage),
      perPage,
      totalItems,
      items,
    };
  }
}

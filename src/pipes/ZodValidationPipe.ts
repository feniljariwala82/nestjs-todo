import {
  ArgumentMetadata,
  PipeTransform,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ZodSchema } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: T, metadata: ArgumentMetadata) {
    // validating only request body, not parameters, query strings and all
    if (metadata.type === 'body') {
      try {
        const parsedValue: any = this.schema.parse(value);
        return parsedValue;
      } catch (error) {
        throw new UnprocessableEntityException(error);
      }
    }

    return value;
  }
}

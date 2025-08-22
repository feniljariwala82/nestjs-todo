import { ApiProperty } from '@nestjs/swagger';

// DTO for individual Zod issue
class ZodIssueDto {
  @ApiProperty({
    description: 'The error code identifying the type of validation failure',
    example: 'invalid_type',
  })
  code: string;

  @ApiProperty({
    description: 'The expected type of the field',
    example: 'string',
  })
  expected: string;

  @ApiProperty({
    description: 'The type received for the field',
    example: 'undefined',
  })
  received: string;

  @ApiProperty({
    description: 'The path to the field that caused the error',
    example: ['email'],
    type: [String], // Array of strings
  })
  path: string[];

  @ApiProperty({
    description: 'A human-readable message describing the error',
    example: 'Email is required',
  })
  message: string;
}

// DTO for the full Zod validation error response
class ZodValidationErrorDto {
  @ApiProperty({
    description: 'An array of validation issues',
    type: [ZodIssueDto], // Array of ZodIssueDto
  })
  issues: ZodIssueDto[];

  @ApiProperty({
    description: 'The name of the error, indicating it comes from Zod',
    example: 'ZodError',
  })
  name: string;
}

class UnauthorizedResponseDto {
  @ApiProperty({
    description: 'Unauthorized',
    example: 'Unauthorized',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 401,
  })
  statusCode: number;
}

export { UnauthorizedResponseDto, ZodValidationErrorDto };

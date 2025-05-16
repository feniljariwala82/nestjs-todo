import { ApiProperty, PickType } from '@nestjs/swagger';

class CreateUserSwaggerDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
    maxLength: 50,
    required: true,
  })
  first_name: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
    maxLength: 50,
    required: true,
  })
  last_name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'fenil@email.com',
    maxLength: 200,
    required: true,
  })
  email: string;

  @ApiProperty({
    description: 'The password for the user account',
    example: '12345678',
    required: true,
  })
  password: string;
}

class LoginSwaggerDto extends PickType(CreateUserSwaggerDto, [
  'email',
  'password',
] as const) {}

export { CreateUserSwaggerDto, LoginSwaggerDto };

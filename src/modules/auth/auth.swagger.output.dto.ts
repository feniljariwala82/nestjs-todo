import { ApiProperty } from '@nestjs/swagger';

class GetUserResponseDto {
  @ApiProperty({
    description: 'ID of the user',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    description: 'Email of the user',
    example: 'john.doe@example.com',
  })
  email: string;
}

class LoginResponseDto {
  @ApiProperty({
    description: 'The JWT token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;
}

class SignupResponseDto {
  @ApiProperty({
    description: 'A message indicating the result of the signup',
    example: 'User created.',
  })
  message: string;
}

export { GetUserResponseDto, LoginResponseDto, SignupResponseDto };

import { ApiProperty } from '@nestjs/swagger';

export class RegistrationUserDto {
  @ApiProperty({ example: 'John', minLength: 1 })
  firstName: string;

  @ApiProperty({ example: 'Smith', minLength: 1 })
  lastName: string;

  @ApiProperty({
    example: 'example@gmail.com',
  })
  email: string;

  @ApiProperty({ minLength: 8 })
  password: string;

  @ApiProperty()
  isRememberMe: boolean;

  @ApiProperty({
    example: 'UA',
  })
  country: string;

  @ApiProperty({ example: '2000-01-15' })
  dateOfBirth: string;
}

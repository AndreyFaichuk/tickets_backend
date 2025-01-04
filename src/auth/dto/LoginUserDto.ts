import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    example: 'example@gmail.com',
  })
  email: string;

  @ApiProperty({ minLength: 8 })
  password: string;

  @ApiProperty()
  isRememberMe: boolean;
}

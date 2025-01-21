import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateColumnDto {
  @ApiProperty({ example: 'Column name' })
  @IsOptional()
  @IsString()
  title?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReplaceAllCardsToColumnDto {
  @ApiProperty({ example: '67a4a912c8c5c1ec036528dh' })
  @IsString()
  fromColumnId: string;

  @ApiProperty({ example: '67a4a912c8c5c1ec036528da' })
  @IsString()
  toColumnId: string;
}

import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ example: 'Column name' })
  title: string;
}

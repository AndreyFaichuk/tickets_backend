import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: '<p>comment text</p>' })
  @IsString()
  comment: string;
}

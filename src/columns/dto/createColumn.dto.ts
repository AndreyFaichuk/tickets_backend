import { ApiProperty } from '@nestjs/swagger';

export class CreateColumnDto {
  @ApiProperty({ example: 'Column name' })
  title: string;

  @ApiProperty({ example: '67bc4ecb1dd635c4683666b3' })
  workspaceId: string;
}

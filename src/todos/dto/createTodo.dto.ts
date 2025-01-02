import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  progress: number;
}

export class UpdateTodoDto extends CreateTodoDto {
  @ApiProperty()
  _id: string;
}

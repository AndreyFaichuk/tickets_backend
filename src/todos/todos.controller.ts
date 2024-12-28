import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { TodosService } from './todos.servise';
import { Todo } from 'src/schemas/todos.schemas';
import { CreateTodoDto, UpdateTodoDto } from './dto/create-todo.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get('/all')
  async getAllTodos(): Promise<Todo[]> {
    return await this.todosService.findAll();
  }

  @Get(':_id')
  async getTodo(@Param() params: { _id: string }): Promise<Todo> {
    return await this.todosService.findOne(params._id);
  }

  @Post('/create')
  async createTodo(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return await this.todosService.create(createTodoDto);
  }

  @Patch('/update')
  async updateTodo(@Body() updateTodoDto: UpdateTodoDto): Promise<Todo> {
    return await this.todosService.update(updateTodoDto);
  }

  @Delete(':_id')
  async deleteTodo(@Param() params: { _id: string }): Promise<Todo> {
    return await this.todosService.delete(params._id);
  }
}

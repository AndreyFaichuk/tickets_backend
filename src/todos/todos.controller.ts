import { Body, Controller, Get, Post } from '@nestjs/common';
import { TodosService } from './todos.servise';
import { Todo } from 'src/schemas/todos.schemas';
import { CreateTodoDto } from './dto/create-todo.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get('/all')
  async getAllTodos(): Promise<Todo[]> {
    return await this.todosService.findAll();
  }

  @Post('/create')
  async createTodo(@Body() createTodoDto: CreateTodoDto): Promise<Todo> {
    return await this.todosService.create(createTodoDto);
  }
}

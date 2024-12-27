import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Observable, from } from 'rxjs';

import { TodosService } from './todos.servise';
import { Todo } from 'src/schemas/todos.schemas';
import { CreateTodoDto, Id, UpdateTodoDto } from './dto/create-todo.dto';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get('/all')
  getAllTodos(): Observable<Todo[]> {
    return from(this.todosService.findAll());
  }

  @Get(':_id')
  getTodo(@Param() params: Id): Observable<Todo> {
    return from(this.todosService.findOne(params._id));
  }

  @Post('/create')
  createTodo(@Body() createTodoDto: CreateTodoDto): Observable<Todo> {
    return from(this.todosService.create(createTodoDto));
  }

  @Patch('/update')
  updateTodo(@Body() updateTodoDto: UpdateTodoDto): Observable<Todo> {
    return from(this.todosService.update(updateTodoDto));
  }

  @Delete(':_id')
  deleteTodo(@Param() params: Id): Observable<Todo> {
    return from(this.todosService.delete(params));
  }
}

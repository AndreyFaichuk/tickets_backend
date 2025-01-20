import { Request } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import { TodosService } from './todos.servise';
import { Todo } from 'src/schemas/todos.schemas';
import { CreateTodoDto } from './dto/createTodo.dto';
import { ApiResponse } from 'src/types';
import { CookieService } from 'src/cookie/cookie.service';
import { COOKIE_NAMES } from 'src/cookie/cookie.constants';

@Controller('todos')
export class TodosController {
  constructor(
    private readonly todosService: TodosService,
    private readonly cookieService: CookieService,
  ) {}

  @Get(':id')
  async getTodo(
    @Param() params: { id: string },
    @Req() req: Request,
  ): ApiResponse<Todo> {
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.todosService.findOne(params.id);
  }

  @Post(':columnId')
  async createTodo(
    @Param() params: { columnId: string },
    @Body() createTodoDto: CreateTodoDto,
    @Req() req: Request,
  ): ApiResponse<Todo> {
    const { columnId } = params;
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.todosService.create(createTodoDto, columnId);
  }

  @Patch(':id')
  async updateTodo(
    @Param() params: { id: string },
    @Body() updateTodoDto: Todo,
    @Req() req: Request,
  ): ApiResponse<Todo> {
    const { id } = params;
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.todosService.update(updateTodoDto, id);
  }

  @Delete(':id/:columnId')
  async deleteTodo(
    @Param() params: { id: string; columnId: string },
    @Req() req: Request,
  ): ApiResponse<Todo> {
    const { id, columnId } = params;
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.todosService.delete(id, columnId);
  }
}

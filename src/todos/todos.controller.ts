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
import { Todo, TodoDocument } from 'src/schemas/todos.schemas';
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

  @Get('/all')
  async getAllTodos(@Req() req: Request): ApiResponse<Todo[]> {
    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    return await this.todosService.findAll(userId);
  }

  @Get(':_id')
  async getTodo(
    @Param() params: { _id: string },
    @Req() req: Request,
  ): ApiResponse<Todo> {
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.todosService.findOne(params._id);
  }

  @Post('/create')
  async createTodo(
    @Body() createTodoDto: CreateTodoDto,
    @Req() req: Request,
  ): ApiResponse<Todo> {
    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    return await this.todosService.create(createTodoDto, userId);
  }

  @Patch('/update')
  async updateTodo(
    @Body() updateTodoDto: TodoDocument,
    @Req() req: Request,
  ): ApiResponse<Todo> {
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.todosService.update(updateTodoDto);
  }

  @Delete(':_id')
  async deleteTodo(
    @Param() params: { _id: string },
    @Req() req: Request,
  ): ApiResponse<Todo> {
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.todosService.delete(params._id);
  }
}

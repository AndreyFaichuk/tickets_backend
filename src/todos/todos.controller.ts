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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';

import { TodosService } from './todos.servise';
import { Todo } from 'src/schemas/todos.schemas';
import { CreateTodoDto } from './dto/createTodo.dto';
import { ApiResponse } from 'src/types';
import { CookieService } from 'src/cookie/cookie.service';
import { COOKIE_NAMES } from 'src/cookie/cookie.constants';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

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
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 5 }]),
  )
  async createTodo(
    @Param() params: { columnId: string },
    @Body() createTodoDto: CreateTodoDto,
    @Req() req: Request,
    @UploadedFiles() files: { attachments: Express.Multer.File[] },
  ): ApiResponse<Todo> {
    const { columnId } = params;
    const { attachments } = files;
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.todosService.create(createTodoDto, columnId, attachments);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'attachments', maxCount: 5 }]),
  )
  async updateTodo(
    @Param() params: { id: string },
    @Body() updateTodoDto: Todo,
    @Req() req: Request,
    @UploadedFiles() files: { attachments: Express.Multer.File[] },
  ): ApiResponse<Todo> {
    const { id } = params;
    const { attachments } = files;
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.todosService.update(updateTodoDto, id, attachments);
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

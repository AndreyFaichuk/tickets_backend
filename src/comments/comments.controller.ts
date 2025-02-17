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
import { Request } from 'express';
import { CommentsService } from './comments.service';
import { CookieService } from 'src/cookie/cookie.service';
import { COOKIE_NAMES } from 'src/cookie/cookie.constants';
import { CreateCommentDto } from 'src/columns/dto/createComment.dto';
import { ApiResponse } from 'src/types';
import { Comment } from 'src/schemas/comments.schema';
import { UpdateCommentDto } from 'src/columns/dto/updateComment.dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('create')
  async createComment(
    @Body() createComment: CreateCommentDto,
    @Req() req: Request,
  ): ApiResponse<Comment> {
    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    return await this.commentsService.create(createComment, userId);
  }

  @Get('all/:todoId')
  async getAllComments(
    @Req() req: Request,
    @Param() params: { todoId: string },
  ): ApiResponse<Comment[]> {
    const { todoId } = params;
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.commentsService.getAll(todoId);
  }

  @Delete(':id')
  async deleteColumn(
    @Param() params: { id: string },
    @Req() req: Request,
  ): ApiResponse<Comment> {
    const { id } = params;

    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    return await this.commentsService.delete(id, userId);
  }

  @Patch(':id')
  async updateComment(
    @Param() params: { id: string },
    @Body() updateComent: UpdateCommentDto,
    @Req() req: Request,
  ): ApiResponse<Comment> {
    const { comment } = updateComent;
    const { id } = params;

    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    return await this.commentsService.update({
      comment,
      commentId: id,
      userId,
    });
  }
}

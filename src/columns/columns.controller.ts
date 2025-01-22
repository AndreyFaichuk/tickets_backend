import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { COOKIE_NAMES } from 'src/cookie/cookie.constants';
import { CookieService } from 'src/cookie/cookie.service';
import { ApiResponse } from 'src/types';
import { CreateColumnDto } from './dto/createColumn.dto';
import { Column } from 'src/schemas/columns.schema';
import { ColumnsService } from './columns.service';
import { UpdateColumnDto } from './dto/updateColumn.dto';
import { MoveCardDto } from './dto/moveCard.dto';

@Controller('columns')
export class ColumnsController {
  constructor(
    private readonly cookieService: CookieService,
    private readonly columnsService: ColumnsService,
  ) {}

  @Post('create')
  async createColumn(
    @Body() createColumnDto: CreateColumnDto,
    @Req() req: Request,
  ): ApiResponse<Column> {
    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    return await this.columnsService.create(createColumnDto, userId);
  }

  @Get('all')
  async getAllColumns(@Req() req: Request): ApiResponse<Column[]> {
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.columnsService.findAll();
  }

  @Delete(':id')
  async deleteColumn(
    @Param() params: { id: string },
    @Req() req: Request,
  ): ApiResponse<Column> {
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.columnsService.delete(params.id);
  }

  @Patch(':id')
  async updateColumn(
    @Param() params: { id: string },
    @Body() updateColumnDto: UpdateColumnDto,
  ): ApiResponse<Column> {
    const { id } = params;

    return this.columnsService.updateColumn(id, updateColumnDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('move')
  async moveCard(@Body() moveCardDto: MoveCardDto) {
    await this.columnsService.moveCard(moveCardDto);

    return;
  }
}

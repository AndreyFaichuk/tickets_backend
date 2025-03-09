import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { WorkspacesService } from './workspaces.service';
import { CookieService } from 'src/cookie/cookie.service';
import { COOKIE_NAMES } from 'src/cookie/cookie.constants';
import { CreateWorkspaceDto } from './dto/createWorkspace.dto';
import { ApiResponse, PaginatedData } from 'src/types';
import { Workspace } from 'src/schemas/workspaces.schema';
import { PaginationDto } from './dto/pagination.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(
    private readonly workspacesService: WorkspacesService,
    private readonly cookieService: CookieService,
  ) {}

  @Post('create')
  async createWorkspace(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @Req() req: Request,
  ): ApiResponse<Workspace> {
    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    return await this.workspacesService.create(createWorkspaceDto, userId);
  }

  @Get('all')
  async getAllWorkspaces(
    @Req() req: Request,
    @Query() paginationDto: PaginationDto,
  ): ApiResponse<PaginatedData<Workspace[]>> {
    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    return await this.workspacesService.getAll(userId, paginationDto);
  }

  @Get(':id')
  async getWorkspace(
    @Param() params: { id: string },
    @Req() req: Request,
  ): ApiResponse<Workspace> {
    this.cookieService.validateCookie(req, COOKIE_NAMES.sessionId);

    return await this.workspacesService.getOne(params.id);
  }
}

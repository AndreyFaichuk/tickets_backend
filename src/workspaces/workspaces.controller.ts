import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { WorkspacesService } from './workspaces.service';
import { CookieService } from 'src/cookie/cookie.service';
import { COOKIE_NAMES } from 'src/cookie/cookie.constants';
import { CreateWorkspaceDto } from './dto/createWorkspace.dto';
import { ApiResponse } from 'src/types';
import { Workspace } from 'src/schemas/workspaces.schema';

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
  async getAllWorkspaces(@Req() req: Request): ApiResponse<Workspace[]> {
    const userId = this.cookieService.validateCookie(
      req,
      COOKIE_NAMES.sessionId,
    );

    return await this.workspacesService.getAll(userId);
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

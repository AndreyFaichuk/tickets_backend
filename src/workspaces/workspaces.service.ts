import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace } from 'src/schemas/workspaces.schema';
import { CreateWorkspaceDto } from './dto/createWorkspace.dto';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { ApiResponse } from 'src/types';
import { stringToObjectId, validateObjectId } from 'src/utils';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
  ) {}

  create(
    createWorkspaceDto: CreateWorkspaceDto,
    userId: string,
  ): ApiResponse<Workspace> {
    validateObjectId(userId);

    return this.workspaceModel.create({
      ...createWorkspaceDto,
      creator: stringToObjectId(userId),
    });
  }

  getAll(userId: string): ApiResponse<Workspace[]> {
    validateObjectId(userId);

    return this.workspaceModel
      .find({ creator: stringToObjectId(userId) })
      .populate([
        {
          path: 'creator',
          model: 'User',
          select: '_id avatarUrl firstName lastName',
        },
        {
          path: 'members',
          model: 'User',
          select: '_id avatarUrl firstName lastName',
        },
      ]);
  }

  async getOne(id: string): Promise<ApiResponse<Workspace>> {
    validateObjectId(id);

    const workspace = await this.workspaceModel.findById(id);

    if (!workspace) {
      throw new CustomException('Workspace not found!', HttpStatus.NOT_FOUND);
    }

    return workspace;
  }
}

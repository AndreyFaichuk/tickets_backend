import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace } from 'src/schemas/workspaces.schema';
import { CreateWorkspaceDto } from './dto/createWorkspace.dto';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { ApiResponse, PaginatedData } from 'src/types';
import { stringToObjectId, validateObjectId } from 'src/utils';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectModel(Workspace.name) private workspaceModel: Model<Workspace>,
  ) {}

  private updateCount(
    workspaceId: string,
    field: 'totalColumns' | 'totalTickets',
    value: number,
  ) {
    return this.workspaceModel.updateOne(
      { _id: stringToObjectId(workspaceId) },
      { $inc: { [field]: value } },
    );
  }

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

  async getAll(
    userId: string,
    { page = 1, limit = 5, search = '' }: PaginationDto,
  ): ApiResponse<PaginatedData<Workspace[]>> {
    validateObjectId(userId);

    const objectIdUserId = stringToObjectId(userId);

    const skip = (page - 1) * limit;

    let searchQuery = {};

    if (search) {
      searchQuery = {
        ...searchQuery,
        title: { $regex: search, $options: 'i' },
      };
    }

    const [workspaces, totalItems] = await Promise.all([
      this.workspaceModel
        .find({
          $or: [{ creator: objectIdUserId }, { members: objectIdUserId }],
          ...searchQuery,
        })
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
        ])
        .skip(skip)
        .limit(limit),

      this.workspaceModel.countDocuments({
        $or: [{ creator: objectIdUserId }, { members: objectIdUserId }],
        ...searchQuery,
      }),
    ]);

    return {
      content: workspaces,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: Number(page),
      },
    };
  }

  async getOne(id: string): ApiResponse<Workspace> {
    validateObjectId(id);

    const workspace = await this.workspaceModel.findById(id);

    if (!workspace) {
      throw new CustomException('Workspace not found!', HttpStatus.NOT_FOUND);
    }

    return workspace;
  }

  incrementTotalColumns(workspaceId: string) {
    return this.updateCount(workspaceId, 'totalColumns', 1);
  }

  decrementTotalColumns(workspaceId: string) {
    return this.updateCount(workspaceId, 'totalColumns', -1);
  }

  incrementTotalTickets(workspaceId: string) {
    return this.updateCount(workspaceId, 'totalTickets', 1);
  }

  decrementTotalTickets(workspaceId: string) {
    return this.updateCount(workspaceId, 'totalTickets', -1);
  }

  async isAllowedToGetWorkspaceContent(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    validateObjectId(userId);
    validateObjectId(workspaceId);

    const workspace = await this.workspaceModel.findOne({
      _id: stringToObjectId(workspaceId),
      $or: [
        { creator: stringToObjectId(userId) },
        { members: stringToObjectId(userId) },
      ],
    });

    if (!workspace) {
      throw new CustomException('Access denied!', HttpStatus.FORBIDDEN);
    }
  }

  async addMemberByInviteToken(
    userId: string,
    inviteToken: string,
  ): ApiResponse<Workspace> {
    validateObjectId(userId);

    const userIdAsObjectId = stringToObjectId(userId);

    const workspace = await this.workspaceModel.findOne({ inviteToken });

    if (!workspace) {
      throw new CustomException('Workspace not found!', HttpStatus.NOT_FOUND);
    }

    if (workspace.creator.toString() === userId) {
      throw new CustomException(
        'User is creator of the workspace!',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (workspace.members.includes(userIdAsObjectId)) {
      throw new CustomException(
        'User is already a member of the workspace!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedWorkspace = await this.workspaceModel.findOneAndUpdate(
      { inviteToken },
      { $addToSet: { members: userIdAsObjectId } },
      { new: true },
    );

    return updatedWorkspace;
  }
}

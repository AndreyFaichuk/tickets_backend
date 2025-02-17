import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { CreateCommentDto } from 'src/columns/dto/createComment.dto';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { Comment } from 'src/schemas/comments.schema';
import { Todo } from 'src/schemas/todos.schemas';
import { ApiResponse } from 'src/types';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
  ) {}

  create(
    createComment: CreateCommentDto,
    userId: string,
  ): ApiResponse<Comment> {
    const { todoId } = createComment;

    if (
      !mongoose.isValidObjectId(userId) ||
      !mongoose.isValidObjectId(todoId)
    ) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.commentModel.create({
      ...createComment,
      creator: userId,
    });
  }

  getAll(todoId: string): ApiResponse<Comment[]> {
    if (!mongoose.isValidObjectId(todoId)) {
      throw new CustomException(
        'Please, provide a valid todoId!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.commentModel.find({ todoId }).populate({
      path: 'creator',
      model: 'User',
      select: '_id avatarUrl firstName lastName',
    });
  }

  getOne(commentId: string): ApiResponse<Comment> {
    if (!mongoose.isValidObjectId(commentId)) {
      throw new CustomException(
        'Please, provide a valid commentId!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.commentModel.findById(commentId);
  }

  async delete(commentId: string, userId: string): ApiResponse<Comment> {
    if (!mongoose.isValidObjectId(commentId)) {
      throw new CustomException(
        'Please, provide a valid commentId!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const commentForDelete = await this.getOne(commentId);

    this.compareUserId(userId, commentForDelete.creator);

    return this.commentModel.findByIdAndDelete(commentId);
  }

  compareUserId(userId: string, commentCreatorId: mongoose.Types.ObjectId) {
    const isUserCreator = userId === commentCreatorId.toString();

    if (!isUserCreator) {
      throw new CustomException(
        'You do not have permission to update this comment',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async update({
    comment,
    commentId,
    userId,
  }: {
    comment: string;
    commentId: string;
    userId: string;
  }): ApiResponse<Comment> {
    const commentForUpdate = await this.getOne(commentId);

    this.compareUserId(userId, commentForUpdate.creator);

    return this.commentModel.findByIdAndUpdate(
      commentId,
      { comment },
      { returnOriginal: false },
    );
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';

import { CreateCommentDto } from 'src/columns/dto/createComment.dto';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { Comment } from 'src/schemas/comments.schema';
import { TodosService } from 'src/todos/todos.servise';
import { ApiResponse } from 'src/types';
import { validateObjectId } from 'src/utils';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<Comment>,
    private readonly todosService: TodosService,
  ) {}

  async create(
    createComment: CreateCommentDto,
    userId: string,
  ): ApiResponse<Comment> {
    const { todoId } = createComment;
    validateObjectId(userId);
    validateObjectId(todoId);

    await this.todosService.incrementTotalComments(todoId);

    return this.commentModel.create({
      ...createComment,
      creator: userId,
    });
  }

  getAll(todoId: string): ApiResponse<Comment[]> {
    validateObjectId(todoId);

    return this.commentModel.find({ todoId }).populate({
      path: 'creator',
      model: 'User',
      select: '_id avatarUrl firstName lastName',
    });
  }

  getOne(commentId: string): ApiResponse<Comment> {
    validateObjectId(commentId);

    return this.commentModel.findById(commentId);
  }

  async delete({
    commentId,
    userId,
    todoId,
  }: {
    commentId: string;
    userId: string;
    todoId: string;
  }): ApiResponse<Comment> {
    validateObjectId(commentId);

    await this.todosService.decrementTotalComments(todoId);

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

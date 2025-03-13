import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getModelToken } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { Comment } from 'src/schemas/comments.schema';
import { TodosService } from 'src/todos/todos.servise';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { CreateCommentDto } from 'src/columns/dto/createComment.dto';
import { stringToObjectId } from 'src/utils';

describe('CommentsService', () => {
  let commentsService: CommentsService;
  let todoService: TodosService;
  let commentModel: Model<Comment>;

  const mockTodoId = '67c1feca0c36807d036bad9a';
  const mockUserId = '67c1feca0c36807d036bad4b';
  const mockCommentId = '67c1feca0c36807d036bad2b';

  const mockCreateComment: CreateCommentDto = {
    comment: 'Lorem comment',
    todoId: mockTodoId,
  };

  const mockComment: Comment = {
    comment: 'Lorem comment',
    creator: stringToObjectId(mockUserId),
    todoId: mockTodoId,
  };

  const mockCommentModel = {
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    create: jest.fn(),
    find: jest.fn().mockReturnValue({
      populate: jest.fn().mockResolvedValueOnce([mockComment]),
    }),
  };

  const mockTodosService = {
    incrementTotalComments: jest.fn(),
    decrementTotalComments: jest.fn(),
  };

  const customException = new CustomException(
    'Please, provide a valid Id!',
    HttpStatus.BAD_REQUEST,
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: TodosService,
          useValue: mockTodosService,
        },
        {
          provide: getModelToken('Comment'),
          useValue: mockCommentModel,
        },
      ],
    }).compile();

    commentsService = module.get<CommentsService>(CommentsService);
    todoService = module.get<TodosService>(TodosService);
    commentModel = module.get<Model<Comment>>(getModelToken('Comment'));
  });

  it('should be defined', () => {
    expect(commentsService).toBeDefined();
  });

  describe('create', () => {
    it('should throw a CustomException if provided id is not valid', () => {
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      const createCall = commentsService.create(mockCreateComment, mockUserId);

      expect(createCall).rejects.toThrow(customException);
    });

    it('should increment total comments in todoService', async () => {
      const { todoId } = mockCreateComment;

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);

      commentsService.create(mockCreateComment, mockUserId);

      await expect(todoService.incrementTotalComments).toHaveBeenCalledWith(
        todoId,
      );
    });

    it('should return comment after creating', async () => {
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
      jest.spyOn(todoService, 'incrementTotalComments');
      jest.spyOn(commentModel, 'create').mockResolvedValue(mockComment as any);

      const createCall = commentsService.create(mockCreateComment, mockUserId);

      await expect(createCall).resolves.toEqual(mockComment);
    });
  });

  describe('getAll', () => {
    it('should throw a CustomException if provided id is not valid', () => {
      const { todoId } = mockComment;

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      expect(() => commentsService.getAll(todoId)).toThrow(customException);
    });

    it('should return comments', async () => {
      const { todoId } = mockComment;

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);

      const populateMock = jest.fn().mockResolvedValue([mockComment]);
      const findMock = jest.fn().mockReturnValue({ populate: populateMock });

      jest.spyOn(commentModel, 'find').mockImplementation(findMock);

      const getAllCall = commentsService.getAll(todoId);

      expect(findMock).toHaveBeenCalledWith({ todoId });

      expect(populateMock).toHaveBeenCalledWith({
        path: 'creator',
        model: 'User',
        select: '_id avatarUrl firstName lastName',
      });

      await expect(getAllCall).resolves.toEqual([mockComment]);
    });
  });

  describe('getOne', () => {
    it('should throw a CustomException if provided id is not valid', () => {
      const { todoId } = mockComment;

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      expect(() => commentsService.getOne(todoId)).toThrow(customException);
    });

    it('should return comment if provided a valid id', () => {
      const { todoId } = mockComment;

      jest.spyOn(commentModel, 'findById').mockResolvedValue(mockComment);

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);

      const getOneCall = commentsService.getOne(todoId);

      expect(getOneCall).resolves.toEqual(mockComment);
    });
  });

  describe('delete', () => {
    it('should throw a CustomException if provided id is not valid', async () => {
      const { todoId } = mockComment;

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      await expect(
        commentsService.delete({
          commentId: mockCommentId,
          todoId,
          userId: mockUserId,
        }),
      ).rejects.toThrow(customException);
    });

    it('should decrement total comments in todoService', async () => {
      const { todoId } = mockCreateComment;

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);

      commentsService.delete({
        commentId: mockCommentId,
        todoId,
        userId: mockUserId,
      });

      await expect(todoService.decrementTotalComments).toHaveBeenCalledWith(
        todoId,
      );
    });

    it('should return comment if it was successfully deleted', async () => {
      const { todoId } = mockComment;

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
      jest.spyOn(todoService, 'incrementTotalComments');
      jest.spyOn(commentsService, 'getOne').mockResolvedValue(mockComment);
      jest.spyOn(commentsService, 'compareUserId');
      jest
        .spyOn(commentModel, 'findByIdAndDelete')
        .mockResolvedValue({ data: mockComment });

      await expect(
        commentsService.delete({
          commentId: mockCommentId,
          todoId,
          userId: mockUserId,
        }),
      ).resolves.toEqual({ data: mockComment });
    });
  });

  describe('compareUserId', () => {
    const customException = new CustomException(
      'You do not have permission to update this comment',
      HttpStatus.FORBIDDEN,
    );

    it('should not throw a CustomException if user is a creator', () => {
      const objectCreatorId = stringToObjectId(mockUserId);

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      expect(() =>
        commentsService.compareUserId(mockUserId, objectCreatorId),
      ).not.toThrow(customException);
    });

    it('should throw a CustomException if user is not a creator', () => {
      const objectCreatorId = stringToObjectId('67c1feca0c36807d036bad4c');

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      expect(() =>
        commentsService.compareUserId(mockUserId, objectCreatorId),
      ).toThrow(customException);
    });
  });

  describe('update', () => {
    it('should return updated comment if user is authorized', async () => {
      const updatedComment = { ...mockComment, comment: 'Updated text' };

      jest.spyOn(commentsService, 'getOne').mockResolvedValue(mockComment);
      jest.spyOn(commentsService, 'compareUserId');
      jest
        .spyOn(commentModel, 'findByIdAndUpdate')
        .mockResolvedValue({ data: updatedComment });

      await expect(
        commentsService.update({
          comment: 'Updated text',
          commentId: mockCommentId,
          userId: mockUserId,
        }),
      ).resolves.toEqual({ data: updatedComment });

      expect(commentsService.getOne).toHaveBeenCalledWith(mockCommentId);

      expect(commentsService.compareUserId).toHaveBeenCalledWith(
        mockUserId,
        mockComment.creator,
      );

      expect(commentModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockCommentId,
        { comment: 'Updated text1' },
        { returnOriginal: false },
      );
    });
  });
});

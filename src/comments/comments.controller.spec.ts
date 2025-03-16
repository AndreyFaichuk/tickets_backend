import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { CookieService } from 'src/cookie/cookie.service';
import { CreateCommentDto } from 'src/columns/dto/createComment.dto';
import { UpdateCommentDto } from 'src/columns/dto/updateComment.dto';
import { Request } from 'express';
import {
  expectExpiredSession,
  expectInvalidSession,
  mockExpiredSession,
  mockInvalidSession,
} from 'test-utils';

describe('CommentsController', () => {
  let controller: CommentsController;
  let commentsService: CommentsService;
  let cookieService: CookieService;

  const mockCreateComment: CreateCommentDto = { comment: 'test', todoId: '1' };
  const mockUpdateComment: UpdateCommentDto = { comment: 'Updated text' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn(),
            getAll: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: CookieService,
          useValue: {
            validateCookie: jest.fn().mockReturnValue('mockedUserId'),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    commentsService = module.get<CommentsService>(CommentsService);
    cookieService = module.get<CookieService>(CookieService);
  });

  beforeEach(() => {
    jest.spyOn(cookieService, 'validateCookie').mockReturnValue('mockedUserId');
  });

  describe('createComment', () => {
    it('should throw a CustomException if session is invalid', async () => {
      mockInvalidSession(cookieService);

      await expectInvalidSession(() =>
        controller.createComment(mockCreateComment, {} as Request),
      );
    });

    it('should throw a CustomException if session is expired', async () => {
      mockExpiredSession(cookieService);

      await expectExpiredSession(() =>
        controller.createComment(mockCreateComment, {} as Request),
      );
    });

    it('should call service and return result', async () => {
      const mockComment = {
        id: '123',
        ...mockCreateComment,
        userId: 'mockedUserId',
      };

      (commentsService.create as jest.Mock).mockResolvedValue(mockComment);

      const result = await controller.createComment(
        mockCreateComment,
        {} as Request,
      );

      expect(commentsService.create).toHaveBeenCalledWith(
        mockCreateComment,
        'mockedUserId',
      );
      expect(result).toEqual(mockComment);
    });
  });

  describe('getAllComments', () => {
    it('should throw a CustomException if session is invalid', async () => {
      mockInvalidSession(cookieService);

      await expectInvalidSession(() =>
        controller.getAllComments({} as Request, { todoId: '1' }),
      );
    });

    it('should throw a CustomException if session is expired', async () => {
      mockExpiredSession(cookieService);

      await expectExpiredSession(() =>
        controller.getAllComments({} as Request, { todoId: '1' }),
      );
    });

    it('should call service and return comments', async () => {
      const mockComments = [{ id: '1', text: 'test', todoId: '1' }];
      (commentsService.getAll as jest.Mock).mockResolvedValue(mockComments);

      const result = await controller.getAllComments({} as Request, {
        todoId: '1',
      });

      expect(commentsService.getAll).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockComments);
    });
  });

  describe('deleteComment', () => {
    it('should throw a CustomException if session is invalid', async () => {
      mockInvalidSession(cookieService);

      await expectInvalidSession(() =>
        controller.deleteColumn({ id: '1', todoId: '2' }, {} as Request),
      );
    });

    it('should throw a CustomException if session is expired', async () => {
      mockExpiredSession(cookieService);

      await expectExpiredSession(() =>
        controller.deleteColumn({ id: '1', todoId: '2' }, {} as Request),
      );
    });

    it('should call service and delete comment', async () => {
      const mockComment = { id: '1', text: 'test' };
      (commentsService.delete as jest.Mock).mockResolvedValue(mockComment);

      const result = await controller.deleteColumn(
        { id: '1', todoId: '2' },
        {} as Request,
      );

      expect(commentsService.delete).toHaveBeenCalledWith({
        commentId: '1',
        userId: 'mockedUserId',
        todoId: '2',
      });
      expect(result).toEqual(mockComment);
    });
  });

  describe('updateComment', () => {
    it('should throw a CustomException if session is invalid', async () => {
      mockInvalidSession(cookieService);
      await expectInvalidSession(() =>
        controller.updateComment({ id: '1' }, mockUpdateComment, {} as Request),
      );
    });

    it('should throw a CustomException if session is expired', async () => {
      mockExpiredSession(cookieService);
      await expectExpiredSession(() =>
        controller.updateComment({ id: '1' }, mockUpdateComment, {} as Request),
      );
    });

    it('should update comment', async () => {
      const mockComment = { id: '1', text: 'Updated text' };

      (commentsService.update as jest.Mock).mockResolvedValue(mockComment);

      const result = await controller.updateComment(
        { id: '1' },
        mockUpdateComment,
        {} as Request,
      );

      expect(commentsService.update).toHaveBeenCalledWith({
        comment: 'Updated text',
        commentId: '1',
        userId: 'mockedUserId',
      });
      expect(result).toEqual(mockComment);
    });
  });
});

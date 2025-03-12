import { HttpStatus } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { Todo } from 'src/schemas/todos.schemas';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { UploadService } from 'src/upload/upload.service';
import { WorkspacesService } from 'src/workspaces/workspaces.service';
import { ConfigService } from '@nestjs/config';
import { ColumnsService } from 'src/columns/columns.service';
import { TodosService } from './todos.servise';
import { Column } from 'src/schemas/columns.schema';
import { stringToObjectId } from 'src/utils';

describe('TodosService', () => {
  let todoService: TodosService;
  let workspacesService: WorkspacesService;
  let columnService: ColumnsService;
  let model: Model<Todo>;

  const mockTodoService = {
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockColumnService = {
    removeCard: jest.fn(),
  };

  const mockWorkspacesService = {
    decrementTotalTickets: jest.fn(),
  };

  const mockTodo: Todo = {
    name: 'Lorem name',
    description: 'Lorem description',
    progress: 91,
    columnId: '67c1febc0c36807d036bad94',
    priority: 'middle',
    attachmentsUrls: [],
    totalComments: 0,
  };

  const mockColumn: Column = {
    title: 'Column for work',
    cards: [],
    creatorId: stringToObjectId('67bef261b2de062a554527c5'),
    workspaceId: stringToObjectId('67c1feae0c36807d036bad9c'),
  };

  const invalidTodoId = 'invalid_invalidTodoId';
  const invalidColumnId = 'invalid_invalidColumnId';

  const todoId = '67c1feca0c36807d036bad9a';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        UploadService,
        {
          provide: getModelToken(Todo.name),
          useValue: mockTodoService,
        },
        {
          provide: WorkspacesService,
          useValue: mockWorkspacesService,
        },
        {
          provide: ConfigService,
          useValue: {},
        },
        {
          provide: ColumnsService,
          useValue: mockColumnService,
        },
      ],
    }).compile();

    todoService = module.get<TodosService>(TodosService);
    workspacesService = module.get<WorkspacesService>(WorkspacesService);
    columnService = module.get<ColumnsService>(ColumnsService);
    model = module.get<Model<Todo>>(getModelToken(Todo.name));
  });

  it('should be defined', () => {
    expect(todoService).toBeDefined();
  });

  describe('findOne', () => {
    it('should find a todo with valid id', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockTodo);

      const result = await todoService.findOne(todoId);

      expect(model.findById).toHaveBeenCalledWith(todoId);
      expect(result).toEqual(mockTodo);
    });

    it('should throw a CustomException if provided id is not valid', async () => {
      const customException = new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      expect(todoService.findOne(invalidTodoId)).rejects.toThrow(
        customException,
      );
    });
  });

  describe('delete', () => {
    it('should throw a CustomException if provided id is not valid', async () => {
      const customException = new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      await expect(
        todoService.delete(invalidTodoId, invalidColumnId),
      ).rejects.toThrow(customException);
    });

    it('should throw a CustomException if todo was not found', async () => {
      const customException = new CustomException(
        `Todo with id ${todoId} not found!`,
        HttpStatus.NOT_FOUND,
      );

      const { columnId } = mockTodo;

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
      jest.spyOn(model, 'findById').mockResolvedValue(null);

      await expect(todoService.delete(todoId, columnId)).rejects.toThrow(
        customException,
      );
    });

    it('should return a todo after successful delete', async () => {
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
      jest.spyOn(model, 'findById').mockResolvedValue(mockTodo);

      jest.spyOn(columnService, 'removeCard').mockResolvedValue(mockColumn);
      jest.spyOn(workspacesService, 'decrementTotalTickets');

      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockTodo);

      const { columnId } = mockTodo;

      const result = await todoService.delete(todoId, columnId);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(todoId);
      expect(result).toEqual(mockTodo);
    });
  });

  describe('update', () => {
    it('should throw a CustomException if provided id is not valid', async () => {
      const customException = new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      await expect(todoService.update(mockTodo, todoId)).rejects.toThrow(
        customException,
      );
    });

    it('should update a todo', async () => {
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
      jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(mockTodo);

      const result = await todoService.update(mockTodo, todoId);

      expect(result).toEqual(mockTodo);
    });
  });
});

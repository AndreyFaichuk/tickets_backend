import { HttpStatus } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { TodosService } from './todos.servise';
import { Todo } from 'src/schemas/todos.schemas';
import { CustomException } from 'src/exceptions/customExeption.exeption';

describe('TodosService', () => {
  let todoService: TodosService;
  let model: Model<Todo>;

  const mockTodoServise = {
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
  };

  const mockTodo = {
    _id: '676eb922afa9ca9dec6c541f',
    description: 'test',
    name: 'namwe',
    progress: 6,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getModelToken(Todo.name),
          useValue: mockTodoServise,
        },
      ],
    }).compile();

    todoService = module.get<TodosService>(TodosService);
    model = module.get<Model<Todo>>(getModelToken(Todo.name));
  });

  it('should be defined', () => {
    expect(todoService).toBeDefined();
  });

  describe('findOne', () => {
    it('should find a todo with valid id', async () => {
      jest.spyOn(model, 'findById').mockResolvedValue(mockTodo);

      const result = await todoService.findOne(mockTodo._id);

      expect(model.findById).toHaveBeenCalledWith(mockTodo._id);
      expect(result).toEqual(mockTodo);
    });

    it('should throw a CustomException if provided id is not valid', async () => {
      const id = 'invalid id';

      const customException = new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      expect(todoService.findOne(id)).rejects.toThrow(customException);
    });
  });

  describe('delete', () => {
    it('should throw a CustomException if provided id is not valid', async () => {
      const id = 'invalid id';

      const customException = new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

      await expect(todoService.delete(id)).rejects.toThrow(customException);
    });

    it('should throw a CustomException if todo was not found', async () => {
      const customException = new CustomException(
        `Todo with id ${mockTodo._id} not found!`,
        HttpStatus.NOT_FOUND,
      );

      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(null);

      await expect(todoService.delete(mockTodo._id)).rejects.toThrow(
        customException,
      );

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockTodo._id);
    });

    it('should return a todo after successful delete', async () => {
      jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
      jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockTodo);

      const result = await todoService.delete(mockTodo._id);

      expect(model.findByIdAndDelete).toHaveBeenCalledWith(mockTodo._id);
      expect(result).toEqual(mockTodo);
    });

    // describe('update', () => {
    //   it('should throw a CustomException if provided id is not valid', async () => {
    //     const mockTodo = {
    //       _id: 'invalid id',
    //       description: 'test',
    //       name: 'namwe',
    //       progress: 6,
    //     };

    //     const customException = new CustomException(
    //       'Please, provide a valid Id!',
    //       HttpStatus.BAD_REQUEST,
    //     );

    //     jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(false);

    //     await expect(todoService.update(mockTodo)).rejects.toThrow(
    //       customException,
    //     );
    //   });

    //   it('should update a todo', async () => {
    //     const mockTodo = {
    //       _id: '676eb922afa9ca9dec6c541f',
    //       description: 'test',
    //       name: 'namwe',
    //       progress: 6,
    //     };

    //     jest.spyOn(mongoose, 'isValidObjectId').mockReturnValue(true);
    //     jest.spyOn(model, 'findByIdAndUpdate').mockResolvedValue(mockTodo);

    //     const result = await todoService.update(mockTodo);

    //     expect(result).toEqual(mockTodo);
    //   });
    // });
  });
});

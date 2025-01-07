import mongoose, { Model } from 'mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Todo, TodoDocument } from 'src/schemas/todos.schemas';
import { CreateTodoDto } from './dto/createTodo.dto';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { ApiResponse } from 'src/types';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  async create(
    createTodoDto: CreateTodoDto,
    userId: string,
  ): ApiResponse<Todo> {
    const newTodo: Todo = { ...createTodoDto, creatorId: userId };

    const createdTodo = new this.todoModel(newTodo);
    return createdTodo.save();
  }

  async findAll(userId: string): ApiResponse<Todo[]> {
    return this.todoModel.find({ creatorId: userId });
  }

  async update(updateTodoDto: TodoDocument): ApiResponse<Todo> {
    const isValidId = mongoose.isValidObjectId(updateTodoDto._id);

    if (!isValidId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.todoModel.findByIdAndUpdate(updateTodoDto._id, updateTodoDto, {
      returnOriginal: false,
    });
  }

  async findOne(_id: string): ApiResponse<Todo> {
    const isValidId = mongoose.isValidObjectId(_id);

    if (!isValidId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.todoModel.findById(_id);
  }

  async delete(_id: string): ApiResponse<Todo> {
    const isValidId = mongoose.isValidObjectId(_id);

    if (!isValidId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const res = await this.todoModel.findByIdAndDelete(_id);
    if (!res) {
      throw new CustomException(
        `Todo with id ${_id} not found!`,
        HttpStatus.NOT_FOUND,
      );
    }

    return res;
  }
}

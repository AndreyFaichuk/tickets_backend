import mongoose, { Model } from 'mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Todo } from 'src/schemas/todos.schemas';
import { CreateTodoDto, UpdateTodoDto } from './dto/create-todo.dto';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { ApiResponse } from 'src/types';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  async create(createTodoDto: CreateTodoDto): Promise<Todo> {
    const createdTodo = new this.todoModel(createTodoDto);
    return createdTodo.save();
  }

  async findAll(): ApiResponse<Todo[]> {
    return this.todoModel.find();
  }

  async update(updateTodoDto: UpdateTodoDto): ApiResponse<Todo> {
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

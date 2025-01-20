import mongoose, { Model } from 'mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Todo } from 'src/schemas/todos.schemas';
import { CreateTodoDto } from './dto/createTodo.dto';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { ApiResponse } from 'src/types';
import { Column } from 'src/schemas/columns.schema';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
    @InjectModel(Column.name) private columnModel: Model<Column>,
  ) {}

  async create(
    createTodoDto: CreateTodoDto,
    columnId: string,
  ): ApiResponse<Todo> {
    if (!mongoose.isValidObjectId(columnId)) {
      throw new CustomException('Invalid column ID!', HttpStatus.BAD_REQUEST);
    }

    const newTodo = new this.todoModel({
      ...createTodoDto,
      columnId,
    });

    const createdTodo = await newTodo.save();

    await this.columnModel.findByIdAndUpdate(
      columnId,
      { $push: { cards: createdTodo._id } },
      { new: true },
    );

    return createdTodo;
  }

  async update(updateTodoDto: Todo, id: string): ApiResponse<Todo> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.todoModel.findByIdAndUpdate(id, updateTodoDto, {
      returnOriginal: false,
    });
  }

  async findOne(id: string): ApiResponse<Todo> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.todoModel.findById(id);
  }

  async delete(id: string, columnId: string): ApiResponse<Todo> {
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(columnId)) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const res = await this.todoModel.findByIdAndDelete(id);
    if (!res) {
      throw new CustomException(
        `Todo with id ${id} not found!`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.columnModel.findByIdAndUpdate(
      columnId,
      { $pull: { cards: new mongoose.Types.ObjectId(id) } },
      { safe: true, multi: false, new: true },
    );

    return res;
  }
}

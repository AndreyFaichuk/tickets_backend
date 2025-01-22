import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Column } from 'src/schemas/columns.schema';
import { CreateColumnDto } from './dto/createColumn.dto';
import { ApiResponse } from 'src/types';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { UpdateColumnDto } from './dto/updateColumn.dto';
import { MoveCardDto } from './dto/moveCard.dto';

@Injectable()
export class ColumnsService {
  constructor(@InjectModel(Column.name) private columnModel: Model<Column>) {}

  async create(
    createColumnDto: CreateColumnDto,
    userId: string,
  ): ApiResponse<Column> {
    const isValidId = mongoose.isValidObjectId(userId);

    if (!isValidId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const newColumn = new this.columnModel({
      ...createColumnDto,
      creatorId: userId,
    });

    return await newColumn.save();
  }

  async findAll(): ApiResponse<Column[]> {
    const columns = await this.columnModel.find().populate({
      path: 'cards',
      model: 'Todo',
    });

    return columns.map((column) => {
      const columnObj = column.toObject();
      const { _id, ...rest } = columnObj;
      return {
        ...rest,
        id: _id.toString(),
      };
    });
  }

  async delete(id: string): ApiResponse<Column> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const res = await this.columnModel.findByIdAndDelete(id);
    if (!res) {
      throw new CustomException(
        `Column with id ${id} not found!`,
        HttpStatus.NOT_FOUND,
      );
    }

    return res;
  }

  async updateColumn(
    columnId: string,
    updateColumnDto: UpdateColumnDto,
  ): ApiResponse<Column> {
    const isValidColumnId = mongoose.isValidObjectId(columnId);

    if (!isValidColumnId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.columnModel.findByIdAndUpdate(columnId, updateColumnDto, {
      returnOriginal: false,
    });
  }

  async moveCard(moveCardDto: MoveCardDto): ApiResponse<void> {
    const { fromColumnId, toColumnId, todoId, fromTodoIndex, toTodoIndex } =
      moveCardDto;

    if (
      !mongoose.isValidObjectId(fromColumnId) ||
      !mongoose.isValidObjectId(toColumnId) ||
      !mongoose.isValidObjectId(todoId)
    ) {
      throw new CustomException(
        'Invalid column or todo ID!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const fromColumn = await this.columnModel.findById(fromColumnId);

    if (fromColumnId === toColumnId) {
      const element = fromColumn.cards.splice(fromTodoIndex, 1);

      fromColumn.cards.splice(toTodoIndex, 0, element[0]);

      await fromColumn.save();

      return;
    }

    const toColumn = await this.columnModel.findById(toColumnId);

    if (!fromColumn || !toColumn) {
      throw new CustomException('Column not found!', HttpStatus.NOT_FOUND);
    }

    const todo = fromColumn.cards.find(
      (card) => card._id.toString() === todoId,
    );

    if (!todo) {
      throw new CustomException(
        'Todo not found in the specified column!',
        HttpStatus.NOT_FOUND,
      );
    }

    fromColumn.cards.splice(fromTodoIndex, 1);
    toColumn.cards.splice(toTodoIndex, 0, todo);

    await fromColumn.save();
    await toColumn.save();
  }
}

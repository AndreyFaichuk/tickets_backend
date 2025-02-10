import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Column } from 'src/schemas/columns.schema';
import { CreateColumnDto } from './dto/createColumn.dto';
import { ApiResponse } from 'src/types';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { UpdateColumnDto } from './dto/updateColumn.dto';
import { MoveCardDto } from './dto/moveCard.dto';
import { ReplaceAllCardsToColumnDto } from './dto/replaceAllTodosToColumn.dto';

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
    const { fromColumnId, toColumnId, todoId, toTodoIndex } = moveCardDto;

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
    const toColumn = await this.columnModel.findById(toColumnId);

    if (!fromColumn || !toColumn) {
      throw new CustomException('Column not found!', HttpStatus.NOT_FOUND);
    }

    const todoIndex = fromColumn.cards.findIndex(
      (card) => card._id.toString() === todoId,
    );

    if (todoIndex === -1) {
      throw new CustomException(
        'Todo not found in the specified column!',
        HttpStatus.NOT_FOUND,
      );
    }

    const [todo] = fromColumn.cards.splice(todoIndex, 1);
    await fromColumn.save();

    if (fromColumnId === toColumnId) {
      fromColumn.cards.splice(toTodoIndex, 0, todo);
      await fromColumn.save();
    } else {
      toColumn.cards.splice(toTodoIndex, 0, todo);
      await toColumn.save();
    }
  }

  async replaceCards(
    replaceAllCardsToColumnDto: ReplaceAllCardsToColumnDto,
  ): Promise<Column> {
    const { fromColumnId, toColumnId } = replaceAllCardsToColumnDto;

    if (
      !mongoose.isValidObjectId(fromColumnId) ||
      !mongoose.isValidObjectId(toColumnId)
    ) {
      throw new CustomException(
        'Please, provide a valid column Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const fromColumn = await this.columnModel.findById(fromColumnId);

    if (!fromColumn) {
      throw new CustomException(
        'Source column not found!',
        HttpStatus.NOT_FOUND,
      );
    }

    const cardIds = fromColumn.cards;

    await this.columnModel.updateOne(
      { _id: toColumnId },
      { $push: { cards: { $each: cardIds } } },
    );

    await this.columnModel.updateOne(
      { _id: fromColumnId },
      { $set: { cards: [] } },
    );

    return await this.columnModel.findById(toColumnId);
  }
}

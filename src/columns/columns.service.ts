import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Column } from 'src/schemas/columns.schema';
import { CreateColumnDto } from './dto/createColumn.dto';
import { ApiResponse } from 'src/types';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { UpdateColumnDto } from './dto/updateColumn.dto';
import { MoveCardDto } from './dto/moveCard.dto';
import { Todo, TodoDocument } from 'src/schemas/todos.schemas';

@Injectable()
export class ColumnsService {
  constructor(@InjectModel(Column.name) private columnModel: Model<Column>) {}

  async create(
    createColumnDto: CreateColumnDto,
    userId: string,
  ): Promise<ApiResponse<Column>> {
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

  async findAll(userId: string): Promise<ApiResponse<Column[]>> {
    const isValidId = mongoose.isValidObjectId(userId);

    if (!isValidId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const columns = await this.columnModel.find({ creatorId: userId });

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
  ): Promise<Column> {
    const isValidColumnId = mongoose.isValidObjectId(columnId);

    if (!isValidColumnId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const column = await this.columnModel.findById(columnId);

    if (updateColumnDto.title) {
      column.title = updateColumnDto.title;
    }

    if (updateColumnDto.card) {
      column.cards = [...column.cards, updateColumnDto.card];
    }

    return await column.save();
  }

  async deleteCard(columnId: string, cardId: string): ApiResponse<Column> {
    const isValidColumnId = mongoose.isValidObjectId(columnId);
    const isValidCardId = mongoose.isValidObjectId(cardId);

    if (!isValidColumnId || !isValidCardId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const updatedColumn = await this.columnModel.findByIdAndUpdate(
      columnId,
      { $pull: { cards: { _id: cardId } } },
      { new: true },
    );

    if (!updatedColumn) {
      throw new CustomException('Column not found!', HttpStatus.NOT_FOUND);
    }

    return updatedColumn;
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

  async findCard(cardId: string, columnId: string): ApiResponse<Todo> {
    if (
      !mongoose.isValidObjectId(cardId) ||
      !mongoose.isValidObjectId(columnId)
    ) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const todos = await this.columnModel.findById(columnId, {
      cards: { $elemMatch: { _id: cardId } },
    });

    return todos.cards[0];
  }

  async updateCard({
    cardId,
    columnId,
    updateTodoDto,
  }: {
    cardId: string;
    columnId: string;
    updateTodoDto: TodoDocument;
  }) {
    if (
      !mongoose.isValidObjectId(cardId) ||
      !mongoose.isValidObjectId(columnId)
    ) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.columnModel.findOneAndUpdate(
      {
        _id: columnId,
        'cards._id': cardId,
      },
      {
        $set: {
          'cards.$': updateTodoDto,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return;
  }
}

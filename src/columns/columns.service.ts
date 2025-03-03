import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Column } from 'src/schemas/columns.schema';
import { CreateColumnDto } from './dto/createColumn.dto';
import { ApiResponse } from 'src/types';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { UpdateColumnDto } from './dto/updateColumn.dto';
import { MoveCardDto } from './dto/moveCard.dto';
import { ReplaceAllCardsToColumnDto } from './dto/replaceAllTodosToColumn.dto';
import { Todo } from 'src/schemas/todos.schemas';
import { stringToObjectId, validateObjectId } from 'src/utils';
import { WorkspacesService } from 'src/workspaces/workspaces.service';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectModel(Column.name) private columnModel: Model<Column>,
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
    private readonly workspacesService: WorkspacesService,
  ) {}

  async create(
    createColumnDto: CreateColumnDto,
    userId: string,
  ): ApiResponse<Column> {
    validateObjectId(userId);

    const { workspaceId } = createColumnDto;

    await this.workspacesService.incrementTotalColumns(workspaceId);

    return this.columnModel.create({
      ...createColumnDto,
      creatorId: stringToObjectId(userId),
      workspaceId: stringToObjectId(workspaceId),
    });
  }

  async findAll(userId: string, workspaceId: string): ApiResponse<Column[]> {
    await this.workspacesService.isAllowedToGetWorkspaceContent(
      userId,
      workspaceId,
    );

    return this.columnModel
      .find({ workspaceId: stringToObjectId(workspaceId) })
      .populate({
        path: 'cards',
        model: 'Todo',
      });
  }

  async delete(id: string): ApiResponse<Column> {
    validateObjectId(id);

    const deletedColumn = await this.columnModel.findByIdAndDelete(id);

    if (!deletedColumn) {
      throw new CustomException(
        `Column with id ${id} not found!`,
        HttpStatus.NOT_FOUND,
      );
    }

    const workspaceId = deletedColumn.workspaceId.toString();

    await this.workspacesService.decrementTotalColumns(workspaceId);

    return deletedColumn;
  }

  updateColumn(
    columnId: string,
    updateColumnDto: UpdateColumnDto,
  ): ApiResponse<Column> {
    validateObjectId(columnId);

    return this.columnModel.findByIdAndUpdate(columnId, updateColumnDto, {
      returnOriginal: false,
    });
  }

  async moveCard(moveCardDto: MoveCardDto): ApiResponse<void> {
    const { fromColumnId, toColumnId, todoId, toTodoIndex } = moveCardDto;

    validateObjectId(fromColumnId);
    validateObjectId(toColumnId);
    validateObjectId(todoId);

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

    await this.todoModel.findByIdAndUpdate(todoId, { columnId: toColumnId });

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
  ): ApiResponse<Column> {
    const { fromColumnId, toColumnId } = replaceAllCardsToColumnDto;

    validateObjectId(fromColumnId);
    validateObjectId(toColumnId);

    const fromColumn = await this.columnModel.findById(fromColumnId);

    if (!fromColumn) {
      throw new CustomException(
        'Source column not found!',
        HttpStatus.NOT_FOUND,
      );
    }

    const cardIds = fromColumn.cards;

    await this.todoModel.updateMany(
      { columnId: fromColumnId },
      { columnId: toColumnId },
    );

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

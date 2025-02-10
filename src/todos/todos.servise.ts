import mongoose, { Model } from 'mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';

import { Todo } from 'src/schemas/todos.schemas';
import { CreateTodoDto } from './dto/createTodo.dto';
import { CustomException } from 'src/exceptions/customExeption.exeption';
import { ApiResponse } from 'src/types';
import { Column } from 'src/schemas/columns.schema';
import { UploadService } from 'src/upload/upload.service';
import { ConfigService } from '@nestjs/config';
import { AWS_S3_BUCKETS, FILE_TYPES_MAP } from 'src/constants';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
    @InjectModel(Column.name) private columnModel: Model<Column>,
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createTodoDto: CreateTodoDto,
    columnId: string,
    attachments?: Express.Multer.File[],
  ): ApiResponse<Todo> {
    if (!mongoose.isValidObjectId(columnId)) {
      throw new CustomException('Invalid column ID!', HttpStatus.BAD_REQUEST);
    }

    const newTodo = new this.todoModel({
      ...createTodoDto,
      columnId,
    });

    if (attachments) {
      const attachmentsUrls = await this.uploadAttachments(
        newTodo._id,
        attachments,
      );

      newTodo.attachmentsUrls = attachmentsUrls;
    }

    const createdTodo = await newTodo.save();

    await this.columnModel.findByIdAndUpdate(
      columnId,
      { $push: { cards: createdTodo._id } },
      { new: true },
    );

    return createdTodo;
  }

  async update(
    updateTodoDto: Todo,
    id: string,
    attachments?: Express.Multer.File[],
  ): ApiResponse<Todo> {
    const isValidId = mongoose.isValidObjectId(id);

    if (!isValidId) {
      throw new CustomException(
        'Please, provide a valid Id!',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (attachments) {
      const prefix = `${id}/`;

      const attachmentBucket = this.configService.getOrThrow(
        AWS_S3_BUCKETS.attachments.bucket,
      );

      const attachmentRegion = this.configService.getOrThrow(
        AWS_S3_BUCKETS.attachments.region,
      );

      await this.uploadService.delete(
        prefix,
        attachmentBucket,
        attachmentRegion,
      );

      const attachmentsUrls = await this.uploadAttachments(id, attachments);

      updateTodoDto.attachmentsUrls = attachmentsUrls;
    } else {
      updateTodoDto.attachmentsUrls = [];
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
    const todoForDelete = await this.findOne(id);

    if (!todoForDelete) {
      throw new CustomException(
        `Todo with id ${id} not found!`,
        HttpStatus.NOT_FOUND,
      );
    }

    if (todoForDelete.attachmentsUrls.length > 0) {
      const attachmentBucket = this.configService.getOrThrow(
        AWS_S3_BUCKETS.attachments.bucket,
      );

      const attachmentRegion = this.configService.getOrThrow(
        AWS_S3_BUCKETS.attachments.region,
      );

      const prefix = `${id}/`;

      await this.uploadService.delete(
        prefix,
        attachmentBucket,
        attachmentRegion,
      );
    }

    const res = await this.todoModel.findByIdAndDelete(id);

    await this.columnModel.findByIdAndUpdate(
      columnId,
      { $pull: { cards: new mongoose.Types.ObjectId(id) } },
      { safe: true, multi: false, new: true },
    );

    return res;
  }

  async uploadAttachments(
    todoId: mongoose.Types.ObjectId | string,
    attachments: Express.Multer.File[],
  ): Promise<string[]> {
    const attachmentBucket = this.configService.getOrThrow(
      AWS_S3_BUCKETS.attachments.bucket,
    );

    const attachmentRegion = this.configService.getOrThrow(
      AWS_S3_BUCKETS.attachments.region,
    );

    const attachmentsPromises = attachments.map(async (attachment) => {
      const key = `${todoId}/${uuidv4()}.${FILE_TYPES_MAP[attachment.mimetype]}`;

      await this.uploadService.upload({
        fileName: key,
        file: attachment.buffer,
        bucket: attachmentBucket,
        region: attachmentRegion,
      });

      return key;
    });

    const attachmentsKeys = await Promise.all(attachmentsPromises);

    return attachmentsKeys.map((attachmentKey) => {
      return this.uploadService.getFileUrl({
        key: attachmentKey,
        bucket: attachmentBucket,
        region: attachmentRegion,
      });
    });
  }
}

import { Model } from 'mongoose';
import { Observable, from, of, switchMap } from 'rxjs';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Todo } from 'src/schemas/todos.schemas';
import { CreateTodoDto, Id, UpdateTodoDto } from './dto/create-todo.dto';
import { CustomException } from 'src/exceptions/customExeption.exeption';

@Injectable()
export class TodosService {
  constructor(@InjectModel(Todo.name) private todoModel: Model<Todo>) {}

  create(createTodoDto: CreateTodoDto): Observable<Todo> {
    console.log(createTodoDto, 'createTodoDto');
    const createdTodo = new this.todoModel(createTodoDto);
    return from(createdTodo.save());
  }

  findAll(): Observable<Todo[]> {
    return from(this.todoModel.find().exec());
  }

  update(updateTodoDto: UpdateTodoDto): Observable<Todo> {
    const updatedTodo = this.todoModel.findByIdAndUpdate(
      updateTodoDto._id,
      updateTodoDto,
      { returnOriginal: false },
    );

    return from(updatedTodo);
  }

  findOne(_id: Id): Observable<Todo> {
    return from(this.todoModel.findById(_id).exec());
  }

  delete(params: Id): Observable<Todo> {
    return from(this.todoModel.findByIdAndDelete(params._id).exec()).pipe(
      switchMap((result) => {
        if (!result) {
          throw new CustomException(
            `Todo with id ${params._id} not found!`,
            HttpStatus.NOT_FOUND,
          );
        }
        return of(result);
      }),
    );
  }
}

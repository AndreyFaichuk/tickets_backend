import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';

import { TodosController } from './todos/todos.controller';
import { TodosService } from './todos/todos.servise';
import { Todo, TodoSchema } from './schemas/todos.schemas';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { User, UserSchema } from './schemas/users.schemas';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { CookieService } from './cookie/cookie.service';
import { ColumnsController } from './columns/columns.controller';
import { ColumnsService } from './columns/columns.service';
import { Column, ColumnSchema } from './schemas/columns.schema';
import { UploadService } from './upload/upload.service';
import { AvatarService } from './avatar/avatar.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { Comment, CommentSchema } from './schemas/comments.schema';
@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DATABASE_URL),
    MongooseModule.forFeature([
      { name: Todo.name, schema: TodoSchema },
      { name: User.name, schema: UserSchema },
      { name: Column.name, schema: ColumnSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [
    TodosController,
    UsersController,
    AuthController,
    ColumnsController,
    CommentsController,
  ],
  providers: [
    TodosService,
    UsersService,
    AuthService,
    CookieService,
    ColumnsService,
    UploadService,
    AvatarService,
    CommentsService,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

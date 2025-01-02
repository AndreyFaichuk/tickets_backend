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
    ]),
  ],
  controllers: [TodosController, UsersController, AuthController],
  providers: [TodosService, UsersService, AuthService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

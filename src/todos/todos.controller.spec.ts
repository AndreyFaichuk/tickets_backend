import { TodosService } from './todos.servise';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodosController } from './todos.controller';
import { Model } from 'mongoose';
import { Todo } from 'src/schemas/todos.schemas';

describe('Todos.service', () => {
  let controller: TodosController;
  let service: TodosService;
  let mockTodoModel: Partial<Model<Todo>>;

  beforeEach(async () => {
    mockTodoModel = {
      create: jest.fn().mockResolvedValue({ _id: '123', ...test }),
    };

    service = new TodosService(mockTodoModel as any);
    controller = new TodosController(service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const test: CreateTodoDto = {
      description: '',
      name: '',
      progress: 5,
    };

    it('should create a new todo', (done) => {
      service.create(test).subscribe((asyncData) => {
        console.log(asyncData, 'asyncData');
        expect(asyncData).toBeDefined();
        done();
      });
    });
  });
});

import { registerDecorator, ValidationOptions } from 'class-validator';

export const IsFileArray = (validationOptions?: ValidationOptions) => {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFileArray',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: File[]) {
          return (
            Array.isArray(value) && value.every((item) => item instanceof File)
          );
        },
        defaultMessage(): string {
          return 'Each item in the array must be a File';
        },
      },
    });
  };
};

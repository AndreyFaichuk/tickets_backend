export type ApiResponse<T> = Promise<T>;
export type ValuesToType<T> = T[keyof T];

export type ApiResponse<T> = Promise<T>;
export type ValuesToType<T> = T[keyof T];

export type PaginatedData<T> = {
  content: T;
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
};

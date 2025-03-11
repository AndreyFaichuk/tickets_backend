import { ValuesToType } from 'src/types';

export const DEFAULT_SORT_OPTION = {
  asc: 'asc',
  desc: 'desc',
} as const;

export const DEFAULT_SORT_OPTION_MAP: Record<SortOption, 1 | -1> = {
  [DEFAULT_SORT_OPTION.asc]: 1,
  [DEFAULT_SORT_OPTION.desc]: -1,
} as const;

export type SortOption = ValuesToType<typeof DEFAULT_SORT_OPTION>;

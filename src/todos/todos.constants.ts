import { ValuesToType } from 'src/types';

export const PRIORITY_VARIANT = {
  low: 'low',
  middle: 'middle',
  high: 'high',
} as const;

export type PriorityType = ValuesToType<typeof PRIORITY_VARIANT>;

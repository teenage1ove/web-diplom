import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Утилита для объединения Tailwind CSS классов
 * Использует clsx для условных классов и tailwind-merge для правильного мержа
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

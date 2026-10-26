import { TransformFnParams } from 'class-transformer';

export const trim = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim() : value;

export const trimLower = ({ value }: TransformFnParams) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export const trimLowerEach = ({ value }: TransformFnParams) =>
  Array.isArray(value)
    ? value.map((v) => (typeof v === 'string' ? v.trim().toLowerCase() : v))
    : value;
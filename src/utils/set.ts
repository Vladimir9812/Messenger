import { merge } from './merge';

export function set(object: Record<string, any>, path: string, value: unknown) {
  if (object && typeof object !== 'object') {
    return object;
  }

  const obj = path
    .split('.')
    .reduceRight((acc, dir) => ({ [dir]: acc }), value);

  merge(object, obj as Record<string, unknown>);
}


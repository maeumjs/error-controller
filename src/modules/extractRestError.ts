import type IMaeumRestError from 'src/modules/interfaces/IMaeumRestError';

function isValidType(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number';
}

export default function extractRestError<T = unknown>(
  unknownError: T,
): IMaeumRestError | undefined {
  try {
    const message: unknown =
      unknownError != null && typeof unknownError === 'object' && 'message' in unknownError
        ? unknownError.message
        : undefined;
    const code: unknown =
      unknownError != null && typeof unknownError === 'object' && 'code' in unknownError
        ? unknownError.code
        : undefined;

    if (isValidType(message) && isValidType(code)) {
      return { message: `${message}`, code: `${code}` };
    }
    return undefined;
  } catch {
    return undefined;
  }
}

import ErrorStackParser from 'error-stack-parser';
import { atOrUndefined } from 'my-easy-fp';
import { randomUUID } from 'node:crypto';

export function getSourceLocation(err: Error, fallback?: string, rewindSize?: number) {
  try {
    const stacktraces = ErrorStackParser.parse(err);
    const stacktrace = atOrUndefined(stacktraces, rewindSize ?? 0);

    if (stacktrace == null) {
      return fallback ?? randomUUID();
    }

    const position = [
      ['project://', stacktrace.fileName, stacktrace.functionName]
        .filter((element) => element != null && element !== '')
        .join('/'),
      [stacktrace.lineNumber, stacktrace.columnNumber]
        .filter((element) => element != null && !Number.isNaN(element))
        .map((element) => `${element}`)
        .join(':'),
    ]
      .filter((element) => element != null && element !== '')
      .join(':');

    return position;
  } catch {
    return fallback ?? randomUUID();
  }
}

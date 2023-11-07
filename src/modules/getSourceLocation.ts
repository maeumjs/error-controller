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

    const position = `project://${stacktrace.fileName ?? ''}/${stacktrace.functionName ?? ''}:${
      stacktrace.lineNumber ?? ''
    }:${stacktrace.columnNumber ?? ''}`;

    return position;
  } catch {
    return fallback ?? randomUUID();
  }
}

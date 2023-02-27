import ErrorStackParser from 'error-stack-parser';
import { atOrUndefined } from 'my-easy-fp';
import { randomUUID } from 'node:crypto';

export default function getErrorCode(
  err: Error,
  fallbackCode?: string,
  encryptor?: (code: string) => string,
) {
  try {
    const stacktraces = ErrorStackParser.parse(err);
    const stacktrace = atOrUndefined(stacktraces, 0);

    if (stacktrace == null) {
      return fallbackCode ?? randomUUID().replace(/-/g, '');
    }

    const position = `project://${stacktrace.fileName ?? ''}/${stacktrace.functionName ?? ''}:${
      stacktrace.lineNumber ?? ''
    }:${stacktrace.columnNumber ?? ''}`;
    const code = encryptor != null ? encryptor(position) : position;

    return code;
  } catch {
    return fallbackCode ?? randomUUID().replace(/-/g, '');
  }
}

import ErrorStackParser from 'error-stack-parser';

export function getRewindStack<T extends Error>(err: T, rewindSize?: number): string | undefined {
  try {
    const frames = ErrorStackParser.parse(err);
    return `Error: ${err.message}${frames
      .slice(rewindSize ?? 1, frames.length)
      .map((frame) => frame.source)
      .filter((frame): frame is string => frame != null)
      .join('\n')}`;
  } catch {
    return err.stack;
  }
}

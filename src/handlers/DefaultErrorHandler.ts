import { ErrorHandler } from '#/handlers/ErrorHandler';
import { noop, safeStringify } from '@maeum/tools';

export class DefaultErrorHandler extends ErrorHandler<Error> {
  public override isSelected(): boolean {
    return true;
  }

  protected preHook = noop;

  protected postHook = noop;

  protected serializor = noop;

  public finalize = noop;

  public stringify(data: unknown): string {
    return safeStringify(data);
  }
}

import { $YMBOL_KEY_ERROR_CONTROLLER } from '#/declarations/SYMBOL_KEY_ERROR_CONTROLLER';
import type { ErrorController } from '#/handlers/ErrorController';
import type { IClassContainer } from '@maeum/tools';
import { isFalse } from 'my-easy-fp';

export function wrapWithoutTryCatch<T = void>(
  container: IClassContainer,
  handler: () => Promise<T>,
): () => Promise<T>;
export function wrapWithoutTryCatch<T = void>(
  container: IClassContainer,
  handler: () => T,
): () => T;
export function wrapWithoutTryCatch<T = void>(
  container: IClassContainer,
  handler: () => T | Promise<T>,
): (() => T) | (() => Promise<T>) {
  if (isFalse(handler instanceof Function)) {
    throw new Error('handler only permit function');
  }

  const controller = container.resolve<ErrorController>($YMBOL_KEY_ERROR_CONTROLLER);

  if (handler.constructor.name === 'AsyncFunction') {
    const wrappedAsyncHandler = async () => {
      try {
        const handled = await handler();
        return handled;
      } catch (err) {
        controller.finalize(err);
        throw err;
      }
    };

    return wrappedAsyncHandler;
  }

  const wrappedSyncHandler = (() => {
    try {
      const handled = handler();
      return handled;
    } catch (err) {
      controller.finalize(err);
      throw err;
    }
  }) as () => T;

  return wrappedSyncHandler;
}

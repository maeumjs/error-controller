import { CE_DI } from '#/di/CE_DI';
import type { ErrorController } from '#/handlers/ErrorController';
import type { IClassContainer } from '@maeum/tools';
import { isFalse } from 'my-easy-fp';

export function wrap<T = void>(
  container: IClassContainer,
  handler: () => Promise<T>,
): () => Promise<T | undefined>;
export function wrap<T = void>(container: IClassContainer, handler: () => T): () => T | undefined;
export function wrap<T = void>(
  container: IClassContainer,
  handler: () => T | undefined | Promise<T | undefined>,
): (() => T | undefined) | (() => Promise<T | undefined>) {
  if (isFalse(handler instanceof Function)) {
    throw new Error('handler only permit function');
  }

  const controller = container.resolve<ErrorController>(CE_DI.ERROR_CONTROLLER);

  if (handler.constructor.name === 'AsyncFunction') {
    const wrappedAsyncHandler = async () => {
      try {
        const handled = await handler();
        return handled;
      } catch (err) {
        controller.finalize(err);
        return undefined;
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
      return undefined;
    }
  }) as () => T;

  return wrappedSyncHandler;
}

import { DefaultErrorHandler } from '#/handlers/DefaultErrorHandler';
import type { ErrorHandler } from '#/handlers/ErrorHandler';
import type { TTranslateFunction } from '#/handlers/interfaces/TTranslateFunction';
import type { IClassContainer } from '@maeum/tools';
import { atOrUndefined } from 'my-easy-fp';

export class ErrorController {
  #handlers: ErrorHandler<any>[];

  #fallback: ErrorHandler<any>;

  #translate: TTranslateFunction;

  constructor(
    container: IClassContainer,
    translate: TTranslateFunction,
    fallback?: ErrorHandler<unknown>,
  ) {
    this.#handlers = [];
    this.#fallback =
      fallback ??
      new DefaultErrorHandler(container, {
        encryption: true,
        translate,
        fallbackMessage: 'internal server error, please retry again later',
        getLanguage: () => 'en',
      });
    this.#translate = translate;
  }

  get handlers(): ErrorHandler<unknown>[] {
    return this.#handlers;
  }

  get translate(): TTranslateFunction {
    return this.#translate;
  }

  add(...handlers: ErrorHandler<any>[]) {
    const names = handlers.map((handler) => handler.constructor.name);
    const next = this.#handlers.filter((handler) => !names.includes(handler.constructor.name));
    next.push(...handlers);

    this.#handlers = next;
  }

  remove(...handlers: ErrorHandler<any>[]) {
    const names = handlers.map((handler) => handler.constructor.name);
    const next = this.#handlers.filter((handler) => !names.includes(handler.constructor.name));

    this.#handlers = next;
  }

  finalize(args: any) {
    const handlers = this.#handlers.filter((handler) => handler.isSelected(args));
    const handler = atOrUndefined(handlers, 0);
    const selected = handler ?? this.#fallback;

    selected.handler(args);
  }
}

import ApiErrorHandler from '#/handlers/ApiErrorHandler';
import DefaultErrorHandler from '#/handlers/DefaultErrorHandler';
import type ErrorHandler from '#/handlers/ErrorHandler';
import HTTPErrorHandler from '#/handlers/HTTPErrorHandler';
import SchemaErrorHandler from '#/handlers/SchemaErrorHandler';
import type IErrorControllerOption from '#/handlers/interfaces/IErrorControllerOption';
import type THTTPErrorHandlerParameters from '#/handlers/interfaces/THTTPErrorHandlerParameters';
import type TTranslateFunction from '#/handlers/interfaces/TTranslateFunction';
import getLanguageFromRequestHeader from '#/modules/getLanguageFromRequestHeader';
import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { atOrUndefined } from 'my-easy-fp';
import { isPromise } from 'util/types';

export default class ErrorController {
  static #it: ErrorController;

  static get it(): ErrorController {
    return ErrorController.#it;
  }

  static #isBootstrap: boolean = false;

  static get isBootstrap(): boolean {
    return ErrorController.#isBootstrap;
  }

  static bootstrap(args?: IErrorControllerOption) {
    const fallbackMessage =
      args?.fallbackMessage ?? 'internal server error, please retry again later';
    const encryption = args?.encryption ?? true;
    const translate = args?.translate ?? (() => undefined);
    const defaultLanguage = args?.defaultLanguage ?? 'en';
    const getLanguage =
      args?.getLanguage ??
      ((languageArgs: THTTPErrorHandlerParameters) =>
        getLanguageFromRequestHeader(
          defaultLanguage,
          languageArgs.req.headers['accept-languages'],
        ));

    ErrorController.#it = new ErrorController(translate);

    if (args?.handlers == null || args?.handlers.length === 0) {
      ErrorController.#it.add(
        new SchemaErrorHandler({
          encryption,
          translate,
          fallbackMessage,
          getLanguage,
        }),
      );
      ErrorController.#it.add(
        new ApiErrorHandler({ encryption, translate, fallbackMessage, getLanguage }),
      );
      ErrorController.#it.add(
        new HTTPErrorHandler({ encryption, translate, fallbackMessage, getLanguage }),
      );

      ErrorController.#it.#fallback =
        args?.fallback ??
        new DefaultErrorHandler({
          encryption,
          translate,
          fallbackMessage,
          getLanguage: () => 'en',
        });
    } else {
      if (args?.includeDefaultHandler ?? false) {
        ErrorController.#it.add(
          new SchemaErrorHandler({
            encryption,
            translate,
            fallbackMessage,
            getLanguage,
          }),
        );
        ErrorController.#it.add(
          new ApiErrorHandler({ encryption, translate, fallbackMessage, getLanguage }),
        );
        ErrorController.#it.add(
          new HTTPErrorHandler({ encryption, translate, fallbackMessage, getLanguage }),
        );
      }

      ErrorController.#it.add(...args.handlers);
      ErrorController.#it.#fallback =
        args?.fallback ??
        new DefaultErrorHandler({
          encryption,
          translate,
          fallbackMessage,
          getLanguage: () => 'en',
        });
    }

    ErrorController.#isBootstrap = true;
  }

  static get fastifyHandler() {
    if (!ErrorController.#isBootstrap) {
      throw new Error('initialize with the `bootstrap` function before use');
    }

    return function globalErrorHandler(
      err: Error & { validation?: ErrorObject[]; statusCode?: number },
      req: FastifyRequest,
      reply: FastifyReply,
    ) {
      ErrorController.#it.finalize({
        $kind: 'fastify',
        err,
        req,
        reply,
      } satisfies THTTPErrorHandlerParameters);
    };
  }

  static wrap<T = void>(handler: () => Promise<T>): () => Promise<T>;
  static wrap<T = void>(handler: () => T): () => T;
  static wrap<T = void>(handler: () => T | Promise<T>): (() => T) | (() => Promise<T>) {
    if (!(handler instanceof Function)) {
      throw new Error('handler only permit function');
    }

    if (handler.constructor.name === 'AsyncFunction') {
      const wrappedAsyncHandler = async () => {
        try {
          const handled = await handler();
          return handled;
        } catch (err) {
          ErrorController.#it.finalize(err);
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
        ErrorController.#it.finalize(err);
        throw err;
      }
    }) as () => T;

    return wrappedSyncHandler;
  }

  static async handle(handler: () => void | Promise<void>) {
    try {
      const handled = handler();

      if (isPromise(handled)) {
        await handled;
      }
    } catch (err) {
      ErrorController.#it.finalize(err);
    }
  }

  #handlers: ErrorHandler<any>[];

  #fallback: ErrorHandler<any>;

  #translate: TTranslateFunction;

  constructor(translate: TTranslateFunction) {
    this.#handlers = [];
    this.#fallback = new DefaultErrorHandler({
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

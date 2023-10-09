import ApiErrorHandler from '#/handlers/ApiErrorHandler';
import DefaultErrorHandler from '#/handlers/DefaultErrorHandler';
import type ErrorHandler from '#/handlers/ErrorHandler';
import SchemaErrorHandler from '#/handlers/SchemaErrorHandler';
import type IErrorControllerOption from '#/handlers/interfaces/IErrorControllerOption';
import type TTranslateFunction from '#/handlers/interfaces/TTranslateFunction';
import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { atOrUndefined } from 'my-easy-fp';

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

    ErrorController.#it = new ErrorController(translate);

    if (args?.handlers != null && args?.handlers.length !== 0) {
      ErrorController.#it.add(...args.handlers);
    } else {
      ErrorController.#it.add(new SchemaErrorHandler({ encryption, translate, fallbackMessage }));
      ErrorController.#it.add(new ApiErrorHandler({ encryption, translate, fallbackMessage }));
      ErrorController.#it.#fallback =
        args?.fallback ?? new DefaultErrorHandler({ encryption, translate, fallbackMessage });
    }

    ErrorController.#isBootstrap = true;
  }

  static get handler() {
    if (!ErrorController.#isBootstrap) {
      throw new Error('initialize with the `bootstrap` function before use');
    }

    return function globalErrorHandler(
      err: Error & { validation?: ErrorObject[] },
      req: FastifyRequest,
      reply: FastifyReply,
    ) {
      ErrorController.#it.send(err, req, reply);
    };
  }

  #handlers: ErrorHandler[];

  #fallback: ErrorHandler;

  #translate: TTranslateFunction;

  constructor(translate: TTranslateFunction) {
    this.#handlers = [];
    this.#fallback = new DefaultErrorHandler({
      encryption: true,
      translate,
      fallbackMessage: 'internal server error, please retry again later',
    });
    this.#translate = translate;
  }

  get handlers(): ErrorHandler[] {
    return this.#handlers;
  }

  get translate(): TTranslateFunction {
    return this.#translate;
  }

  add(...handlers: ErrorHandler[]) {
    const names = handlers.map((handler) => handler.constructor.name);
    const next = this.#handlers.filter((handler) => !names.includes(handler.constructor.name));
    next.push(...handlers);

    this.#handlers = next;
  }

  remove(...handlers: ErrorHandler[]) {
    const names = handlers.map((handler) => handler.constructor.name);
    const next = this.#handlers.filter((handler) => !names.includes(handler.constructor.name));

    this.#handlers = next;
  }

  send(err: Error & { validation?: ErrorObject[] }, req: FastifyRequest, reply: FastifyReply) {
    const handlers = this.#handlers.filter((handler) => handler.isSelected(err, req, reply));
    const handler = atOrUndefined(handlers, 0);
    const selected = handler ?? this.#fallback;

    selected.handler(err, req, reply);
  }
}

import type RestError from '#errors/RestError';
import executeHook from '#modules/executeHook';
import getErrorCode from '#modules/getErrorCode';
import getLocaleHandler from '#modules/getLocaleHandler';
import getMessageIdHandler from '#modules/getMessageIdHandler';
import getSourceLocation from '#modules/getSourceLocation';
import { CE_MAEUM_DEFAULT_ERROR_HANDLER } from '#modules/interfaces/CE_MAEUM_DEFAULT_ERROR_HANDLER';
import type IMaeumRestError from '#modules/interfaces/IMaeumRestError';
import type TMaeumErrorHandlerHooks from '#modules/interfaces/TMaeumErrorHandlerHooks';
import type TMaeumErrorHandlerLocales from '#modules/interfaces/TMaeumErrorHandlerLocales';
import type TMaeumMessageIdHandles from '#modules/interfaces/TMaeumMessageIdHandles';
import type { FastifyReply, FastifyRequest } from 'fastify';

export default function restErrorHandler(
  err: RestError,
  req: FastifyRequest,
  reply: FastifyReply,
  options: {
    messages?: TMaeumMessageIdHandles;
    locales: TMaeumErrorHandlerLocales;
    restReplyStringify: (data: unknown) => string;
    hooks?: TMaeumErrorHandlerHooks;
    encryptor?: (code: string) => string;
  },
) {
  executeHook({
    hooks: options.hooks,
    id: CE_MAEUM_DEFAULT_ERROR_HANDLER.REST_ERROR,
    type: 'pre',
    err,
    req,
    reply,
  });

  const getMessageId = getMessageIdHandler(
    options.messages,
    CE_MAEUM_DEFAULT_ERROR_HANDLER.REST_ERROR,
  );
  const getLocale = getLocaleHandler(options.locales, CE_MAEUM_DEFAULT_ERROR_HANDLER.REST_ERROR);

  const code = getErrorCode(err);
  const { status } = err;
  const sourceLocation = getSourceLocation(
    err,
    'P02:d727a4e4ee984bd780517284397a297d',
    options.encryptor,
  );

  const getMessage = () => {
    if (err.polyglot == null && err.message === '') {
      return 'internal server error';
    }

    if (err.polyglot == null) {
      return err.message;
    }

    const message = getLocale?.(req, getMessageId(err.polyglot.id), err.polyglot.params);

    if (message == null && err.message === '') {
      return 'internal server error';
    }

    if (message == null) {
      return err.message;
    }

    return message;
  };

  const message = getMessage();

  const getErrorDataHandler = (): IMaeumRestError => {
    if (code == null) {
      const data: IMaeumRestError = {
        code: sourceLocation,
        message,
        data: err.data,
      };

      return data;
    }

    if (err.data == null) {
      const data: IMaeumRestError = {
        code,
        message,
        data: sourceLocation,
      };

      return data;
    }

    const data: IMaeumRestError = {
      code,
      message,
      data: { ...err.data, source: sourceLocation },
    };

    return data;
  };

  const data = getErrorDataHandler();
  const serialized = options.restReplyStringify(data);

  executeHook({
    hooks: options.hooks,
    id: CE_MAEUM_DEFAULT_ERROR_HANDLER.REST_ERROR,
    type: 'post',
    err,
    req,
    reply,
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  reply.code(status).send(serialized);
}

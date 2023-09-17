import type { FastifyReply, FastifyRequest } from 'fastify';
import type RestError from 'src/errors/RestError';
import executeHook from 'src/modules/executeHook';
import getErrorCode from 'src/modules/getErrorCode';
import getLocaleHandler from 'src/modules/getLocaleHandler';
import getMessageIdHandler from 'src/modules/getMessageIdHandler';
import getSourceLocation from 'src/modules/getSourceLocation';
import { CE_MAEUM_DEFAULT_ERROR_HANDLER } from 'src/modules/interfaces/CE_MAEUM_DEFAULT_ERROR_HANDLER';
import type IMaeumRestError from 'src/modules/interfaces/IMaeumRestError';
import type TMaeumErrorHandlerHooks from 'src/modules/interfaces/TMaeumErrorHandlerHooks';
import type TMaeumErrorHandlerLocales from 'src/modules/interfaces/TMaeumErrorHandlerLocales';
import type TMaeumMessageIdHandles from 'src/modules/interfaces/TMaeumMessageIdHandles';

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

  if (err.header != null) {
    Object.entries(err.header).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      reply.header(key, value);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  reply.code(status).send(serialized);
}

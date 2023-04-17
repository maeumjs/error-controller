import maeumRestErrorSchema from '#data/maeumRestErrorSchema';
import maeumValidationErrorSchema from '#data/maeumValidationErrorSchema';
import RestError from '#errors/RestError';
import executeHook from '#modules/executeHook';
import getLocaleHandler from '#modules/getLocaleHandler';
import getMessageIdHandler from '#modules/getMessageIdHandler';
import getSourceLocation from '#modules/getSourceLocation';
import restErrorHandler from '#modules/handlers/restErrorHandler';
import schemaValidationHandler from '#modules/handlers/schemaValidationHandler';
import { CE_MAEUM_DEFAULT_ERROR_HANDLER } from '#modules/interfaces/CE_MAEUM_DEFAULT_ERROR_HANDLER';
import { CE_MAEUM_ERROR_HANDLER_LOCALE_ID } from '#modules/interfaces/CE_MAEUM_ERROR_HANDLER_LOCALE_ID';
import type { IMaeumErrorHandler } from '#modules/interfaces/IMaeumErrorHandler';
import type IMaeumRestError from '#modules/interfaces/IMaeumRestError';
import type { TMaeumEncryptor } from '#modules/interfaces/MaeumFunctions';
import type TMaeumErrorHandlerHooks from '#modules/interfaces/TMaeumErrorHandlerHooks';
import type TMaeumErrorHandlerLocales from '#modules/interfaces/TMaeumErrorHandlerLocales';
import type TMaeumMessageIdHandles from '#modules/interfaces/TMaeumMessageIdHandles';
import type { ErrorObject } from 'ajv';
import fastJsonStringify, { type Options as FastJsonStringiftOptions } from 'fast-json-stringify';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import httpStatusCodes from 'http-status-codes';
import { isError, isFalse } from 'my-easy-fp';

export default function errorHandler(
  handlers: IMaeumErrorHandler[],
  locales: TMaeumErrorHandlerLocales,
  options?: {
    hooks?: TMaeumErrorHandlerHooks;
    messages?: TMaeumMessageIdHandles;
    encryptor?: TMaeumEncryptor;
    fastJsonStringiftOptions?: FastJsonStringiftOptions;
  },
) {
  const validationErrorReplyStringify: (data: unknown) => string = fastJsonStringify(
    maeumValidationErrorSchema,
    options?.fastJsonStringiftOptions,
  );
  const restReplyStringify: (data: unknown) => string = fastJsonStringify(
    maeumRestErrorSchema,
    options?.fastJsonStringiftOptions,
  );

  const hookHandle: Parameters<FastifyInstance['setErrorHandler']>[0] = async (
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      const handlerIndex = handlers.reduce((selected, handler, idx) => {
        if (Number.isNaN(selected) && handler.selector(err, req, reply)) {
          try {
            handler.handler(err, req, reply);
            return idx;
          } catch {
            return idx;
          }
        }

        return selected;
      }, NaN);

      if (isFalse(Number.isNaN(handlerIndex))) {
        return;
      }

      if (err.validation != null) {
        schemaValidationHandler(err, err.validation, req, reply, {
          locales,
          validationErrorReplyStringify,
          messages: options?.messages,
          hooks: options?.hooks,
          encryptor: options?.encryptor,
        });
      } else if (isError(err) && err instanceof RestError) {
        restErrorHandler(err, req, reply, {
          locales,
          restReplyStringify,
          messages: options?.messages,
          hooks: options?.hooks,
          encryptor: options?.encryptor,
        });
      } else {
        executeHook({
          hooks: options?.hooks,
          id: CE_MAEUM_DEFAULT_ERROR_HANDLER.INTERNAL_SERVER_ERROR,
          type: 'pre',
          err,
          req,
          reply,
        });

        const code = getSourceLocation(
          err,
          'P03:f221ec81a80f4c4e9e79038add5c70d2',
          options?.encryptor,
        );
        const getMessageId = getMessageIdHandler(
          options?.messages,
          CE_MAEUM_DEFAULT_ERROR_HANDLER.INTERNAL_SERVER_ERROR,
        );

        const body: IMaeumRestError = {
          code,
          message:
            getLocaleHandler(locales, CE_MAEUM_DEFAULT_ERROR_HANDLER.INTERNAL_SERVER_ERROR)?.(
              req,
              getMessageId(CE_MAEUM_ERROR_HANDLER_LOCALE_ID.INTERNAL_SERVER_ERROR),
            ) ?? err.message,
        };

        const serialized = restReplyStringify(body);

        executeHook({
          hooks: options?.hooks,
          id: CE_MAEUM_DEFAULT_ERROR_HANDLER.INTERNAL_SERVER_ERROR,
          type: 'post',
          err,
          req,
          reply,
        });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        reply.code(httpStatusCodes.INTERNAL_SERVER_ERROR).send(serialized);
      }
    } catch (caught) {
      const code = getSourceLocation(
        err,
        'P04:0e5cff808ae44904a267217345dee818',
        options?.encryptor,
      );

      const getMessageId = getMessageIdHandler(
        options?.messages,
        CE_MAEUM_DEFAULT_ERROR_HANDLER.INTERNAL_SERVER_ERROR,
      );

      const body: IMaeumRestError = {
        code,
        message:
          getLocaleHandler(locales, CE_MAEUM_DEFAULT_ERROR_HANDLER.INTERNAL_SERVER_ERROR)?.(
            req,
            getMessageId(CE_MAEUM_ERROR_HANDLER_LOCALE_ID.INTERNAL_SERVER_ERROR),
          ) ?? err.message,
      };

      const serialized = restReplyStringify(body);

      executeHook({
        hooks: options?.hooks,
        id: CE_MAEUM_DEFAULT_ERROR_HANDLER.INTERNAL_SERVER_ERROR,
        type: 'post',
        err,
        req,
        reply,
      });

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      reply.code(httpStatusCodes.INTERNAL_SERVER_ERROR).send(serialized);
    }
  };

  return hookHandle;
}

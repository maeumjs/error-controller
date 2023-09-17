import type { ErrorObject } from 'ajv';
import fastJsonStringify, { type Options as FastJsonStringiftOptions } from 'fast-json-stringify';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import httpStatusCodes from 'http-status-codes';
import { isError, isFalse } from 'my-easy-fp';
import maeumRestErrorSchema from 'src/data/maeumRestErrorSchema';
import maeumValidationErrorSchema from 'src/data/maeumValidationErrorSchema';
import RestError from 'src/errors/RestError';
import executeHook from 'src/modules/executeHook';
import getLocaleHandler from 'src/modules/getLocaleHandler';
import getMessageIdHandler from 'src/modules/getMessageIdHandler';
import getSourceLocation from 'src/modules/getSourceLocation';
import restErrorHandler from 'src/modules/handlers/restErrorHandler';
import schemaValidationHandler from 'src/modules/handlers/schemaValidationHandler';
import { CE_MAEUM_DEFAULT_ERROR_HANDLER } from 'src/modules/interfaces/CE_MAEUM_DEFAULT_ERROR_HANDLER';
import { CE_MAEUM_ERROR_HANDLER_LOCALE_ID } from 'src/modules/interfaces/CE_MAEUM_ERROR_HANDLER_LOCALE_ID';
import type { IMaeumErrorHandler } from 'src/modules/interfaces/IMaeumErrorHandler';
import type IMaeumRestError from 'src/modules/interfaces/IMaeumRestError';
import type { TMaeumEncryptor } from 'src/modules/interfaces/MaeumFunctions';
import type TMaeumErrorHandlerHooks from 'src/modules/interfaces/TMaeumErrorHandlerHooks';
import type TMaeumErrorHandlerLocales from 'src/modules/interfaces/TMaeumErrorHandlerLocales';
import type TMaeumMessageIdHandles from 'src/modules/interfaces/TMaeumMessageIdHandles';

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
            executeHook({
              hooks: options?.hooks,
              id: handler.id,
              type: 'pre',
              err,
              req,
              reply,
            });

            const sendBakup = reply.send.bind(reply);
            const sendWithHook = (payload?: unknown) => {
              executeHook({
                hooks: options?.hooks,
                id: handler.id,
                type: 'post',
                err,
                req,
                reply,
              });

              // eslint-disable-next-line @typescript-eslint/no-floating-promises
              return sendBakup(payload);
            };
            // eslint-disable-next-line no-param-reassign
            reply.send = sendWithHook.bind(reply);

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

        if ('header' in err && typeof err.header === 'object' && err.header != null) {
          Object.entries(err.header).forEach(([key, value]) => {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            reply.header(key, value);
          });
        }

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

      if ('header' in err && typeof err.header === 'object' && err.header != null) {
        Object.entries(err.header).forEach(([key, value]) => {
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          reply.header(key, value);
        });
      }

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      reply.code(httpStatusCodes.INTERNAL_SERVER_ERROR).send(serialized);
    }
  };

  return hookHandle;
}

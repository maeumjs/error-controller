import getErrorCode from '#modules/getErrorCode';
import getFallbackHook from '#modules/getFallbackHook';
import getFallbackLocale from '#modules/getFallbackLocale';
import getSchemaValidationError from '#modules/getSchemaValidationError';
import { CE_MAEUM_ERROR_HANDLER_LOCALE_ID } from '#modules/interfaces/CE_MAEUM_ERROR_HANDLER_LOCALE_ID';
import type IMaeumErrorHandler from '#modules/interfaces/IMaeumErrorHandler';
import type IMaeumRestError from '#modules/interfaces/IMaeumRestError';
import type IMaeumValidationError from '#modules/interfaces/IMaeumValidationError';
import maeumRestErrorSchema from '#modules/interfaces/maeumRestErrorSchema';
import maeumValidationErrorSchema from '#modules/interfaces/maeumValidationErrorSchema';
import type { ErrorObject } from 'ajv';
import fastJsonStringify, { type Options as FastJsonStringiftOptions } from 'fast-json-stringify';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import httpStatusCodes from 'http-status-codes';
import { isError, isFalse } from 'my-easy-fp';
import RestError from 'src/errors/RestError';

export default function errorHandler(
  handlers: IMaeumErrorHandler[],
  prefix: string,
  locale: Record<
    number,
    (req: FastifyRequest, id: string, params?: Record<string, string>) => string
  >,
  hook?: Record<
    number,
    (err: Error & { validation?: ErrorObject[] }, req: FastifyRequest, reply: FastifyReply) => void
  >,
  encryptor?: (code: string) => string,
  option?: FastJsonStringiftOptions,
) {
  const validationErrorReplyStringify: (data: unknown) => string = fastJsonStringify(
    maeumValidationErrorSchema,
    option,
  );
  const restReplyStringify: (data: unknown) => string = fastJsonStringify(
    maeumRestErrorSchema,
    option,
  );

  const hookHandle: Parameters<FastifyInstance['setErrorHandler']>[0] = async (
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {
    try {
      if (err.validation != null) {
        const validation = getSchemaValidationError(err.validation);
        const code = getErrorCode(err, 'P01:14152B97535A4F03B966F88417DEC63E', encryptor);

        const data: IMaeumValidationError = {
          code,
          validation,
          message:
            getFallbackLocale(httpStatusCodes.BAD_REQUEST, locale)?.(
              req,
              `${prefix}${CE_MAEUM_ERROR_HANDLER_LOCALE_ID.BAD_REQUEST}`,
            ) ?? 'invalid request parameter',
        };

        const serialized = validationErrorReplyStringify(data);

        getFallbackHook(httpStatusCodes.BAD_REQUEST, hook)?.(err, req, reply);

        await reply.code(httpStatusCodes.BAD_REQUEST).send(serialized);

        return;
      }

      if (isError(err) && err instanceof RestError) {
        const code = getErrorCode(err, 'P02:d727a4e4ee984bd780517284397a297d', encryptor);
        const { status } = err;
        const message =
          err.polyglot != null
            ? getFallbackLocale(status, locale)?.(req, err.polyglot.id, err.polyglot.params) ??
              err.message
            : err.message;

        const data: IMaeumRestError = {
          code,
          message,
          data: err.data,
        };

        const serialized = restReplyStringify(data);

        getFallbackHook(httpStatusCodes.BAD_REQUEST, hook)?.(err, req, reply);

        await reply.code(httpStatusCodes.BAD_REQUEST).send(serialized);

        return;
      }

      const handlerIndex = handlers.reduce((selected, handler, idx) => {
        if (Number.isNaN(selected) && handler.selector(err, req, reply)) {
          handler.handler(err, req, reply);
          return idx;
        }

        return selected;
      }, NaN);

      if (isFalse(Number.isNaN(handlerIndex))) {
        return;
      }

      const code = getErrorCode(err, 'P03:f221ec81a80f4c4e9e79038add5c70d2', encryptor);

      const body: IMaeumRestError = {
        code,
        message:
          locale[httpStatusCodes.INTERNAL_SERVER_ERROR]?.(
            req,
            `${prefix}${CE_MAEUM_ERROR_HANDLER_LOCALE_ID.INTERNAL_SERVER_ERROR}`,
          ) ?? err.message,
      };

      const serialized = restReplyStringify(body);

      getFallbackHook(httpStatusCodes.BAD_REQUEST, hook)?.(err, req, reply);

      await reply.code(httpStatusCodes.INTERNAL_SERVER_ERROR).send(serialized);
    } catch (caught) {
      const code = getErrorCode(err, 'P04:0e5cff808ae44904a267217345dee818', encryptor);

      const body: IMaeumRestError = {
        code,
        message:
          locale[httpStatusCodes.INTERNAL_SERVER_ERROR]?.(
            req,
            `${prefix}${CE_MAEUM_ERROR_HANDLER_LOCALE_ID.INTERNAL_SERVER_ERROR}`,
          ) ?? err.message,
      };

      const serialized = restReplyStringify(body);

      getFallbackHook(httpStatusCodes.BAD_REQUEST, hook)?.(err, req, reply);

      await reply.code(httpStatusCodes.INTERNAL_SERVER_ERROR).send(serialized);
    }
  };

  return hookHandle;
}

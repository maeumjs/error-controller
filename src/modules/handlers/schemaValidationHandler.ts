import executeHook from '#modules/executeHook';
import getErrorCode from '#modules/getErrorCode';
import getLocaleHandler from '#modules/getLocaleHandler';
import getMessageIdHandler from '#modules/getMessageIdHandler';
import getSchemaValidationError from '#modules/getSchemaValidationError';
import getSourceLocation from '#modules/getSourceLocation';
import { CE_MAEUM_DEFAULT_ERROR_HANDLER } from '#modules/interfaces/CE_MAEUM_DEFAULT_ERROR_HANDLER';
import { CE_MAEUM_ERROR_HANDLER_LOCALE_ID } from '#modules/interfaces/CE_MAEUM_ERROR_HANDLER_LOCALE_ID';
import type IMaeumValidationError from '#modules/interfaces/IMaeumValidationError';
import type TMaeumErrorHandlerHooks from '#modules/interfaces/TMaeumErrorHandlerHooks';
import type TMaeumErrorHandlerLocales from '#modules/interfaces/TMaeumErrorHandlerLocales';
import type TMaeumMessageIdHandles from '#modules/interfaces/TMaeumMessageIdHandles';
import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';
import httpStatusCodes from 'http-status-codes';

export default function schemaValidationHandler(
  err: Error & { validation?: ErrorObject[] },
  validation: ErrorObject[],
  req: FastifyRequest,
  reply: FastifyReply,
  options: {
    messages?: TMaeumMessageIdHandles;
    locales: TMaeumErrorHandlerLocales;
    validationErrorReplyStringify: (data: unknown) => string;
    hooks?: TMaeumErrorHandlerHooks;
    encryptor?: (code: string) => string;
  },
) {
  executeHook({
    hooks: options.hooks,
    id: CE_MAEUM_DEFAULT_ERROR_HANDLER.BAD_REQUEST,
    type: 'pre',
    err,
    req,
    reply,
  });

  const getMessageId = getMessageIdHandler(
    options.messages,
    CE_MAEUM_DEFAULT_ERROR_HANDLER.BAD_REQUEST,
  );
  const getLocale = getLocaleHandler(options.locales, CE_MAEUM_DEFAULT_ERROR_HANDLER.BAD_REQUEST);

  const schemaValidation = getSchemaValidationError(validation);
  const code = getErrorCode(err);
  const sourceLocation = getSourceLocation(
    err,
    'P01:14152B97535A4F03B966F88417DEC63E',
    options.encryptor,
  );

  const getValidationErrorData = () => {
    if (code == null) {
      const data: IMaeumValidationError = {
        code: sourceLocation,
        message:
          getLocale?.(req, getMessageId(CE_MAEUM_ERROR_HANDLER_LOCALE_ID.BAD_REQUEST)) ??
          'invalid request parameter',
        validation: schemaValidation,
      };

      return data;
    }

    if ('data' in err && err.data != null && typeof err.data === 'object') {
      const data: IMaeumValidationError & { data: unknown } = {
        code,
        message:
          getLocale?.(req, getMessageId(CE_MAEUM_ERROR_HANDLER_LOCALE_ID.BAD_REQUEST)) ??
          'invalid request parameter',
        validation: schemaValidation,
        data: { ...err.data, source: sourceLocation },
      };

      return data;
    }

    const data: IMaeumValidationError & { data?: string } = {
      code,
      validation: schemaValidation,
      message:
        getLocale?.(req, getMessageId(CE_MAEUM_ERROR_HANDLER_LOCALE_ID.BAD_REQUEST)) ??
        'invalid request parameter',
      data: sourceLocation,
    };

    return data;
  };

  const data: IMaeumValidationError = getValidationErrorData();
  const serialized = options.validationErrorReplyStringify(data);

  executeHook({
    hooks: options.hooks,
    id: CE_MAEUM_DEFAULT_ERROR_HANDLER.BAD_REQUEST,
    type: 'post',
    err,
    req,
    reply,
  });

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  reply.code(httpStatusCodes.BAD_REQUEST).send(serialized);
}

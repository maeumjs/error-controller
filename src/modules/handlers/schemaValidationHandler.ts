import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';
import httpStatusCodes from 'http-status-codes';
import executeHook from 'src/modules/executeHook';
import getErrorCode from 'src/modules/getErrorCode';
import getLocaleHandler from 'src/modules/getLocaleHandler';
import getMessageIdHandler from 'src/modules/getMessageIdHandler';
import getSchemaValidationError from 'src/modules/getSchemaValidationError';
import getSourceLocation from 'src/modules/getSourceLocation';
import { CE_MAEUM_DEFAULT_ERROR_HANDLER } from 'src/modules/interfaces/CE_MAEUM_DEFAULT_ERROR_HANDLER';
import { CE_MAEUM_ERROR_HANDLER_LOCALE_ID } from 'src/modules/interfaces/CE_MAEUM_ERROR_HANDLER_LOCALE_ID';
import type IMaeumValidationError from 'src/modules/interfaces/IMaeumValidationError';
import type TMaeumErrorHandlerHooks from 'src/modules/interfaces/TMaeumErrorHandlerHooks';
import type TMaeumErrorHandlerLocales from 'src/modules/interfaces/TMaeumErrorHandlerLocales';
import type TMaeumMessageIdHandles from 'src/modules/interfaces/TMaeumMessageIdHandles';

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

  if ('header' in err && typeof err.header === 'object' && err.header != null) {
    Object.entries(err.header).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      reply.header(key, value);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  reply.code(httpStatusCodes.BAD_REQUEST).send(serialized);
}

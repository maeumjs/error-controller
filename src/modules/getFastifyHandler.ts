import { $YMBOL_KEY_ERROR_CONTROLLER } from '#/declarations/SYMBOL_KEY_ERROR_CONTROLLER';
import type { ErrorController } from '#/handlers/ErrorController';
import type { THTTPErrorHandlerParameters } from '#/handlers/interfaces/THTTPErrorHandlerParameters';
import type { IClassContainer } from '@maeum/tools';
import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';

export function getFastifyHandler(container: IClassContainer) {
  const errorController = container.resolve<ErrorController>($YMBOL_KEY_ERROR_CONTROLLER);

  return function globalErrorHandler(
    err: Error & { validation?: ErrorObject[]; statusCode?: number },
    req: FastifyRequest,
    reply: FastifyReply,
  ) {
    errorController.finalize({
      $kind: 'fastify',
      err,
      req,
      reply,
    } satisfies THTTPErrorHandlerParameters);
  };
}

import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';

export type TMaeumErrorHandlerFunction = (
  err: Error & { validation?: ErrorObject[] },
  req: FastifyRequest,
  reply: FastifyReply,
) => unknown;

export type TMaeumErrorHandlerSelector = (
  err: Error & { validation?: ErrorObject[] },
  req: FastifyRequest,
  reply: FastifyReply,
) => boolean;

export interface IMaeumErrorHandler {
  /** error hander name */
  id: string;

  /** error handler selector */
  selector: TMaeumErrorHandlerSelector;

  /** error handler function */
  handler: TMaeumErrorHandlerFunction;
}

import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';

export interface IMaeumErrorHandlerHook {
  pre?: (
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    reply: FastifyReply,
  ) => void;
  post?: (
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    reply: FastifyReply,
  ) => void;
}

type TMaeumErrorHandlerHooks = Record<string, IMaeumErrorHandlerHook>;

export default TMaeumErrorHandlerHooks;

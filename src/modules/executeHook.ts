import type TMaeumErrorHandlerHooks from '#modules/interfaces/TMaeumErrorHandlerHooks';
import type { IMaeumErrorHandlerHook } from '#modules/interfaces/TMaeumErrorHandlerHooks';
import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { CE_MAEUM_DEFAULT_ERROR_HANDLER } from './interfaces/CE_MAEUM_DEFAULT_ERROR_HANDLER';

export default function executeHook({
  hooks,
  id,
  type,
  err,
  req,
  reply,
}: {
  hooks?: TMaeumErrorHandlerHooks;
  id: string;
  type: keyof IMaeumErrorHandlerHook;
  err: Error & { validation?: ErrorObject[] };
  req: FastifyRequest;
  reply: FastifyReply;
}) {
  try {
    const handler = hooks?.[id]?.[type];

    if (handler != null) {
      handler(err, req, reply);
    } else {
      const common = hooks?.[CE_MAEUM_DEFAULT_ERROR_HANDLER.COMMON]?.[type];

      if (common != null) {
        common(err, req, reply);
      }
    }
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    true;
  }
}

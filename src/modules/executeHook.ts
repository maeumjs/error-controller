import type TMaeumErrorHandlerHooks from '#modules/interfaces/TMaeumErrorHandlerHooks';
import type { IMaeumErrorHandlerHook } from '#modules/interfaces/TMaeumErrorHandlerHooks';
import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';

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
    }
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    true;
  }
}

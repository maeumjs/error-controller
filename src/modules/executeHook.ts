import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { CE_MAEUM_DEFAULT_ERROR_HANDLER } from 'src/modules/interfaces/CE_MAEUM_DEFAULT_ERROR_HANDLER';
import type IMaeumErrorHandlerHook from 'src/modules/interfaces/IMaeumErrorHandlerHook';
import type TMaeumErrorHandlerHooks from 'src/modules/interfaces/TMaeumErrorHandlerHooks';

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

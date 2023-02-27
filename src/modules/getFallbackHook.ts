import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';

export default function getFallbackHook(
  code: number,
  hook?: Record<
    number,
    (err: Error & { validation?: ErrorObject[] }, req: FastifyRequest, reply: FastifyReply) => void
  >,
):
  | ((
      err: Error & { validation?: ErrorObject[] },
      req: FastifyRequest,
      reply: FastifyReply,
    ) => void)
  | undefined {
  const hookFunc = hook?.[code];

  if (hookFunc != null) {
    return hookFunc;
  }

  const fallbackCode = Math.floor(code / 100) * 100;
  return hook?.[fallbackCode];
}

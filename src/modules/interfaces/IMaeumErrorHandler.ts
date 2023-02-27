import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';

export default interface IMaeumErrorHandler {
  selector: (
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    reply: FastifyReply,
  ) => boolean;
  handler: (
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    reply: FastifyReply,
  ) => {};
}

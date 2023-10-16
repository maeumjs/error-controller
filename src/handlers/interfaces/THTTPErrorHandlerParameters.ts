import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';

type THTTPErrorHandlerParameters = {
  $kind: 'fastify';
  err: Error & { validation?: ErrorObject[]; statusCode?: number };
  req: FastifyRequest;
  reply: FastifyReply;
};

export default THTTPErrorHandlerParameters;

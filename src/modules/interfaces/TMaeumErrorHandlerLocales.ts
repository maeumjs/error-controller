import type { FastifyRequest } from 'fastify';

type TMaeumErrorHandlerLocales = Record<
  string,
  (req: FastifyRequest, id: string, params?: Record<string, string>) => string
>;

export default TMaeumErrorHandlerLocales;

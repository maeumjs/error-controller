import type { FastifyRequest } from 'fastify';

type TTranslateFunction = (req: FastifyRequest, option: unknown) => string | undefined;

export default TTranslateFunction;

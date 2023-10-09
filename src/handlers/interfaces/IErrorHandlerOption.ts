import type TTranslateFunction from '#/handlers/interfaces/TTranslateFunction';
import type { FastifyRequest } from 'fastify';

export default interface IErrorHandlerOption {
  encryption: boolean;
  fallbackMessage: string | ((req: FastifyRequest) => string);
  translate: TTranslateFunction;
}

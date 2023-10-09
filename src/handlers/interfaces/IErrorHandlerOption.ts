import type TTranslateFunction from '#/handlers/interfaces/TTranslateFunction';
import type { FastifyRequest } from 'fastify';

export default interface IErrorHandlerOption {
  type: 'send' | 'serialize';
  encryption: boolean;
  fallbackMessage: string | ((req: FastifyRequest) => string);
  translate: TTranslateFunction;
}

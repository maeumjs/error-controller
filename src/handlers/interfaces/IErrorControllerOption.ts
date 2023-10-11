import type ErrorHandler from '#/handlers/ErrorHandler';
import type TTranslateFunction from '#/handlers/interfaces/TTranslateFunction';
import type { FastifyRequest } from 'fastify';

export default interface IErrorControllerOption {
  translate?: TTranslateFunction;
  encryption?: boolean;
  fallback?: ErrorHandler;
  includeDefaultHandler?: boolean;
  handlers?: ErrorHandler[];
  fallbackMessage?: string | ((req: FastifyRequest) => string);
}

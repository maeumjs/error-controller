import ApiError from '#/errors/ApiError';
import ErrorHandler from '#/handlers/ErrorHandler';
import getSourceLocation from '#/modules/getSourceLocation';
import { EncryptContiner, noop, safeStringify } from '@maeum/tools';
import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';
import httpStatusCodes from 'http-status-codes';
import { isError, parseBool } from 'my-easy-fp';

export default class ApiErrorHandler extends ErrorHandler {
  public override isSelected(err: Error & { validation?: ErrorObject[] }): boolean {
    return parseBool(isError(err)) && err instanceof ApiError;
  }

  protected preHook(
    err: Error & { validation?: ErrorObject[] },
    _req: FastifyRequest,
    reply: FastifyReply,
  ): void {
    if (isError(err) && err instanceof ApiError) {
      reply.status(err.option.status);

      Object.entries(err.option.header ?? {}).forEach(([key, value]) => {
        reply.header(key, value);
      });
    } else {
      reply.status(httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  protected postHook = noop;

  protected serializor(
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    _reply: FastifyReply,
  ): void {
    if (isError(err) && err instanceof ApiError) {
      const { code, payload } = err.reply;
      const message = this.getMessage(req, {
        translate: err.reply.translateArgs,
        message: err.message,
      });

      const encrypted =
        this.option.encryption && EncryptContiner.isBootstrap
          ? EncryptContiner.it.encrypt(code)
          : code;

      this.payload = { code: encrypted, payload, message };
    } else {
      const code = getSourceLocation(err);
      const { message } = err;
      const encrypted =
        this.option.encryption && EncryptContiner.isBootstrap
          ? EncryptContiner.it.encrypt(code)
          : code;

      this.payload = { code: encrypted, message };
    }
  }

  public stringify(data: unknown): string {
    return safeStringify(data);
  }
}
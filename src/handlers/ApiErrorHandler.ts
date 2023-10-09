import ApiError from '#/errors/ApiError';
import ErrorHandler from '#/handlers/ErrorHandler';
import getSourceLocation from '#/modules/getSourceLocation';
import { EncryptContiner, noop, safeStringify } from '@maeum/tools';
import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';
import httpStatusCodes from 'http-status-codes';
import { isError } from 'my-easy-fp';

export default class ApiErrorHandler extends ErrorHandler {
  public override isSelected(err: Error & { validation?: ErrorObject[] }): boolean {
    return isError(err) != null && err instanceof ApiError;
  }

  protected preHook(
    err: Error & { validation?: ErrorObject[] },
    _req: FastifyRequest,
    reply: FastifyReply,
  ): void {
    if (isError(err) && err instanceof ApiError) {
      reply.status(err.reply.status);

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
  ): { code: string; message?: string; payload?: unknown } {
    if (isError(err) != null && err instanceof ApiError) {
      const { code, payload } = err.reply;
      const message = this.getMessage(req, {
        translate: err.reply.i18n,
        message: err.message,
      });

      const encrypted =
        this.option.encryption && EncryptContiner.isBootstrap
          ? EncryptContiner.it.encrypt(code)
          : code;

      return { code: encrypted, payload, message };
    }

    const code = getSourceLocation(err);
    const { message } = err;
    const encrypted =
      this.option.encryption && EncryptContiner.isBootstrap
        ? EncryptContiner.it.encrypt(code)
        : code;

    return { code: encrypted, message };
  }

  public stringify(data: unknown): string {
    return safeStringify(data);
  }
}

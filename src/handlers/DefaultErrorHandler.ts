import ErrorHandler from '#/handlers/ErrorHandler';
import getSourceLocation from '#/modules/getSourceLocation';
import { EncryptContiner, noop, safeStringify } from '@maeum/tools';
import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';
import httpStatusCodes from 'http-status-codes';
import { isError } from 'my-easy-fp';

export default class DefaultErrorHandler extends ErrorHandler {
  public override isSelected(err: Error & { validation?: ErrorObject[] }): boolean {
    return isError(err) != null && err.validation != null;
  }

  protected preHook(
    _err: Error & { validation?: ErrorObject[] },
    _req: FastifyRequest,
    reply: FastifyReply,
  ): void {
    reply.status(httpStatusCodes.INTERNAL_SERVER_ERROR);
    reply.header('Content-Type', 'application/json');
  }

  protected postHook = noop;

  protected serializor(
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    _reply: FastifyReply,
  ): { code: string; message?: string } {
    const code = getSourceLocation(err);
    const message = this.getMessage(req, { message: err.message });
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

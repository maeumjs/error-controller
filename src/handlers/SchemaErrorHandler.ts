import ErrorHandler from '#/handlers/ErrorHandler';
import getSchemaValidationError from '#/modules/getSchemaValidationError';
import getSourceLocation from '#/modules/getSourceLocation';
import { EncryptContiner, noop, safeStringify } from '@maeum/tools';
import type { ErrorObject } from 'ajv';
import type { FastifyReply, FastifyRequest } from 'fastify';
import httpStatusCodes from 'http-status-codes';
import { isError, parseBool } from 'my-easy-fp';

export default class SchemaErrorHandler extends ErrorHandler {
  public override isSelected(err: Error & { validation?: ErrorObject[] }): boolean {
    return parseBool(isError(err)) && err.validation != null;
  }

  protected preHook(
    _err: Error & { validation?: ErrorObject[] },
    _req: FastifyRequest,
    reply: FastifyReply,
  ): void {
    reply.status(httpStatusCodes.BAD_REQUEST);
    reply.header('Content-Type', 'application/json');
  }

  protected postHook = noop;

  protected serializor(
    err: Error & { validation?: ErrorObject[] },
    req: FastifyRequest,
    _reply: FastifyReply,
  ): void {
    if (parseBool(isError(err)) && err.validation != null) {
      const code = getSourceLocation(err);
      const message = this.getMessage(req, { message: err.message });
      const encrypted =
        this.option.encryption && EncryptContiner.isBootstrap
          ? EncryptContiner.it.encrypt(code)
          : code;
      const validation = getSchemaValidationError(err.validation);

      this.payload = { code: encrypted, validation, message };
    } else {
      const code = getSourceLocation(err);
      const message = this.getMessage(req, { message: err.message });
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

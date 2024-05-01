import { ApiError } from '#/errors/ApiError';
import { HTTPErrorHandler } from '#/handlers/HTTPErrorHandler';
import type { THTTPErrorHandlerParameters } from '#/handlers/interfaces/THTTPErrorHandlerParameters';
import { getSourceLocation } from '#/modules/getSourceLocation';
import { ENCRYPTIONER_SYMBOL_KEY, noop, safeStringify, type Encryptioner } from '@maeum/tools';
import httpStatusCodes from 'http-status-codes';
import { isError } from 'my-easy-fp';

export class ApiErrorHandler extends HTTPErrorHandler {
  public override isSelected(args: THTTPErrorHandlerParameters): boolean {
    if (!('$kind' in args) || args.$kind !== 'fastify') {
      return false;
    }

    if (isError(args.err) == null) {
      return false;
    }

    if (!(args.err instanceof ApiError)) {
      return false;
    }

    return true;
  }

  protected preHook(args: THTTPErrorHandlerParameters): void {
    super.preHook(args);

    const { err } = args;

    if (isError(err) && err instanceof ApiError) {
      args.reply.status(err.reply.status);

      Object.entries(err.option.header ?? {}).forEach(([key, value]) => {
        args.reply.header(key, value);
      });
    } else {
      args.reply.status(httpStatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  protected postHook = noop;

  protected serializor(args: THTTPErrorHandlerParameters): {
    code: string;
    message?: string;
    payload?: unknown;
  } {
    const encryptioner = this.$container.resolve<Encryptioner>(ENCRYPTIONER_SYMBOL_KEY);

    if (isError(args.err) != null && args.err instanceof ApiError) {
      const { code, payload } = args.err.reply;
      const message = this.getMessage(args, {
        translate: args.err.reply.i18n,
        message: args.err.message,
      });

      const encrypted = this.option.encryption ? encryptioner.encrypt(code) : code;

      if (typeof payload === 'object') {
        return { code: encrypted, ...payload, message };
      }

      return { code: encrypted, payload, message };
    }

    const code = getSourceLocation(args.err);
    const { message } = args.err;
    const encrypted = this.option.encryption ? encryptioner.encrypt(code) : code;

    return { code: encrypted, message };
  }

  public stringify(data: unknown): string {
    return safeStringify(data);
  }
}

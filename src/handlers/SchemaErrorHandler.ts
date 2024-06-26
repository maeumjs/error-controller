import { ApiError } from '#/errors/ApiError';
import { HTTPErrorHandler } from '#/handlers/HTTPErrorHandler';
import type { THTTPErrorHandlerParameters } from '#/handlers/interfaces/THTTPErrorHandlerParameters';
import { getSourceLocation } from '#/modules/getSourceLocation';
import type { ISchemaErrorReply } from '#/modules/interfaces/ISchemaErrorReply';
import {
  CE_DI as TOOLS_DI,
  getValidationErrorSummary,
  noop,
  safeStringify,
  type Encryptioner,
} from '@maeum/tools';
import httpStatusCodes from 'http-status-codes';
import { isError } from 'my-easy-fp';

export class SchemaErrorHandler extends HTTPErrorHandler {
  public override isSelected(args: THTTPErrorHandlerParameters): boolean {
    if (!('$kind' in args) || args.$kind !== 'fastify') {
      return false;
    }

    if (isError(args.err) == null) {
      return false;
    }

    if (args.err.validation == null) {
      return false;
    }

    return true;
  }

  protected preHook(args: THTTPErrorHandlerParameters): void {
    super.preHook(args);

    const statusCode = args.err instanceof ApiError ? args.err.reply.status : args.err.statusCode;
    args.reply.status(statusCode ?? httpStatusCodes.BAD_REQUEST);
  }

  protected postHook = noop;

  protected serializor(args: THTTPErrorHandlerParameters): {
    code: string;
    message?: string;
    validation?: ISchemaErrorReply['validation'];
  } {
    if (isError(args.err) != null && args.err.validation != null) {
      const code = getSourceLocation(args.err);
      const message = this.getMessage(args, { message: args.err.message });
      const encryptioner = this.$container.resolve<Encryptioner>(TOOLS_DI.ENCRYPTIONER);
      const encrypted = this.option.encryption ? encryptioner.encrypt(code) : code;
      const validation = getValidationErrorSummary(args.err.validation);

      return { code: encrypted, validation, message };
    }

    const code = getSourceLocation(args.err);
    const message = this.getMessage(args, { message: args.err.message });
    const encryptioner = this.$container.resolve<Encryptioner>(TOOLS_DI.ENCRYPTIONER);
    const encrypted = this.option.encryption ? encryptioner.encrypt(code) : code;

    return { code: encrypted, message };
  }

  public stringify(data: unknown): string {
    return safeStringify(data);
  }
}

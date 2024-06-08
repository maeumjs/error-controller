import { ApiError } from '#/errors/ApiError';
import { ErrorHandler } from '#/handlers/ErrorHandler';
import type { THTTPErrorHandlerParameters } from '#/handlers/interfaces/THTTPErrorHandlerParameters';
import { getSourceLocation } from '#/modules/getSourceLocation';
import { CE_DI as TOOLS_DI, noop, safeStringify, type Encryptioner } from '@maeum/tools';
import httpStatusCodes from 'http-status-codes';
import { isError } from 'my-easy-fp';

export class HTTPErrorHandler extends ErrorHandler<THTTPErrorHandlerParameters> {
  public isSelected(args: THTTPErrorHandlerParameters): boolean {
    if (!('$kind' in args) || args.$kind !== 'fastify') {
      return false;
    }

    if (isError(args.err) == null) {
      return false;
    }

    return true;
  }

  public stringify(data: unknown): string {
    return safeStringify(data);
  }

  get option() {
    return this.$option;
  }

  /**
   * 모든 오류를 일관성 있게 error handler에서 처리하는 경우, route에서 설정한 것과 다른 형태로
   * replay 데이터를 응답하게 되는 경우가 있다. 500오류가 발생하면 그런 상황이 발생하기 쉽다. 그래서
   * 이런 경우에 send나 serialize에 강제로 데이터를 보낼 수 있는데 이 때 header의 content-type
   * 데이터 등을 변경해야 할 수 있다. 이 때 hook을 사용한다
   *
   * If all errors are handled consistently by the error handler, you may end up
   * responding with replay data in a different format than you set in the route.
   * This is most likely to happen with 500 errors, so you may want to force send
   * or serialize to send the data, which may require changing the content-type
   * data in the header, etc. This is where hooks come in
   */

  protected preHook(args: THTTPErrorHandlerParameters): void {
    if ('setRequestError' in args.req && typeof args.req.setRequestError === 'function') {
      args.req.setRequestError(args.err);
    }

    args.reply.status(args.err.statusCode ?? httpStatusCodes.INTERNAL_SERVER_ERROR);
    args.reply.header('Content-Type', 'application/json');
  }

  protected postHook = noop;

  protected serializor(args: THTTPErrorHandlerParameters): { code: string; message?: string } {
    const encryptioner = this.$container.resolve<Encryptioner>(TOOLS_DI.ENCRYPTIONER);
    const code = getSourceLocation(args.err);
    const message = this.getMessage(args, {
      translate: args.err instanceof ApiError ? args.err.reply.i18n : undefined,
      message: args.err.message,
    });
    const encrypted = this.option.encryption ? encryptioner.encrypt(code) : code;

    return { code: encrypted, message };
  }

  finalize(args: THTTPErrorHandlerParameters, payload: string): void {
    setImmediate(() => {
      args.reply.send(payload);
    });
  }

  getMessage(args: THTTPErrorHandlerParameters, i18n: { translate?: unknown; message?: string }) {
    try {
      if (i18n.translate != null) {
        const language = this.$option.getLanguage(args);
        const message = this.$option.translate(language, i18n.translate);

        if (message != null) {
          return message;
        }
      }

      if (i18n.message != null) {
        return i18n.message;
      }

      if (typeof this.$option.fallbackMessage === 'string') {
        return this.$option.fallbackMessage;
      }

      return this.$option.fallbackMessage(args);
    } catch {
      return undefined;
    }
  }

  handler(args: THTTPErrorHandlerParameters) {
    this.preHook(args);
    const payload = this.serializor(args);
    const stringified = this.stringify(payload);
    this.finalize(args, stringified);
    this.postHook(args);
  }
}

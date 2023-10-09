/* eslint-disable @typescript-eslint/naming-convention */
import type IApiErrorOption from '#/errors/interfaces/IApiErrorOption';
import type {
  TApiErrorReplyArgs,
  TPartialApiErrorReplyArgs,
} from '#/errors/interfaces/TApiErrorReplyArgs';
import getSourceLocation from '#/modules/getSourceLocation';
import httpStatusCodes from 'http-status-codes';

export default class ApiError<TDATA_TYPE = unknown> extends Error {
  accessor reply: TApiErrorReplyArgs;

  accessor option: IApiErrorOption;

  static getRestErrorReply(
    reply?: TApiErrorReplyArgs | TPartialApiErrorReplyArgs,
  ): TApiErrorReplyArgs {
    return {
      code: reply?.code ?? '',
      message: reply?.message ?? 'unknown error raised',
      i18n: reply?.i18n ?? undefined,
      payload: reply?.payload ?? undefined,
    } satisfies TApiErrorReplyArgs;
  }

  static getRestErrorOption(reply?: Partial<IApiErrorOption>): IApiErrorOption {
    return {
      status: reply?.status ?? httpStatusCodes.INTERNAL_SERVER_ERROR,
      header: reply?.header ?? undefined,
      logging: reply?.logging ?? undefined,
    } satisfies IApiErrorOption;
  }

  constructor(
    args:
      | string
      | Error
      | ApiError<TDATA_TYPE>
      | {
          reply: TPartialApiErrorReplyArgs<TDATA_TYPE>;
          option?: Partial<IApiErrorOption>;
        },
  ) {
    if (typeof args === 'string') {
      super(args);

      const reply = ApiError.getRestErrorReply({ message: args });
      const option = ApiError.getRestErrorOption();
      const code = getSourceLocation(this);

      this.reply = { ...reply, code };
      this.option = option;
    } else if (args instanceof ApiError) {
      super(args.message);

      const reply = ApiError.getRestErrorReply(args.reply);
      const option = ApiError.getRestErrorOption(args.option);
      const code = getSourceLocation(this);

      this.stack = args.stack;

      this.reply = { ...reply, code };
      this.option = option;
    } else if (args instanceof Error) {
      super(args.message);

      const reply = ApiError.getRestErrorReply({ message: args.message });
      const option = ApiError.getRestErrorOption();
      const code = getSourceLocation(args);

      this.stack = args.stack;

      this.reply = { ...reply, code };
      this.option = option;
    } else {
      const reply = ApiError.getRestErrorReply(args?.reply);
      const option = ApiError.getRestErrorOption(args?.option);

      super(reply.message);

      const code = reply.code != null && reply.code !== '' ? reply.code : getSourceLocation(this);

      this.reply = { ...reply, code };
      this.option = option;
    }
  }
}

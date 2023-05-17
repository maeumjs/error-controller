/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type IMaeumRestError from '#modules/interfaces/IMaeumRestError';
import type IPolyglot from '#modules/interfaces/IPolyglot';
import ErrorStackParser from 'error-stack-parser';
import httpStatusCodes from 'http-status-codes';

type TRestErrorArgs<T> =
  | Error
  | { error: Error; code?: string; logging?: Record<string, string> }
  | RestError<T>
  | (Omit<IMaeumRestError<T>, 'code' | 'status' | 'message'> & {
      code?: string;
      status?: number;
      message: string;
      logging?: Record<string, string>;
    })
  | (Omit<IMaeumRestError<T>, 'code' | 'status' | 'message'> & {
      code?: string;
      status?: number;
      polyglot: IPolyglot;
      logging?: Record<string, string>;
    });

export default class RestError<TBodyType = unknown, THeaderType = unknown>
  extends Error
  implements Omit<IMaeumRestError<TBodyType, THeaderType>, 'code'>
{
  /** message of error */
  accessor code: string | undefined;

  /** message of error */
  accessor message: string;

  /** additional header data for response */
  accessor header: THeaderType | undefined;

  /** additional body data for response */
  accessor body: TBodyType | undefined;

  /** http status code */
  accessor status: number;

  /** polyglot information */
  accessor polyglot: IPolyglot | undefined;

  /** additional information for logging */
  accessor logging: Record<string, unknown> | undefined;

  public static getRefiedStack<T>(err: RestError<T>): string | undefined {
    try {
      const frames = ErrorStackParser.parse(err);
      return `Error: ${err.message}${frames
        .slice(1, frames.length)
        .map((frame) => frame.source)
        .filter((frame): frame is string => frame != null)
        .join('\n')}`;
    } catch {
      return err.stack;
    }
  }

  public static create<T>(args: TRestErrorArgs<T>): RestError<T> {
    if (args instanceof Error) {
      const err = new RestError<T>({
        message: args.message,
        status: httpStatusCodes.INTERNAL_SERVER_ERROR,
      });

      err.stack = args.stack;
      return err;
    }

    if ('error' in args) {
      const err = new RestError<T>({
        code: args.code,
        message: args.error.message,
        status: httpStatusCodes.INTERNAL_SERVER_ERROR,
        logging: args.logging,
      });

      err.stack = args.error.stack;
      return err;
    }

    if (args instanceof RestError) {
      const err = new RestError<T>({
        code: args.code,
        body: args.body,
        header: args.header,
        status: args.status,
        message: args.message,
        polyglot: args.polyglot,
        logging: args.logging,
      });

      err.stack = args.stack;
      return err;
    }

    if ('polyglot' in args) {
      const err = new RestError<T>({
        code: args.code,
        body: args.body,
        header: args.header,
        status: args.status ?? httpStatusCodes.INTERNAL_SERVER_ERROR,
        message: args.polyglot.id,
        polyglot: args.polyglot,
        logging: args.logging,
      });

      err.stack = RestError.getRefiedStack(err);
      return err;
    }

    const err = new RestError<T>({
      code: args.code,
      body: args.body,
      header: args.header,
      status: args.status ?? httpStatusCodes.INTERNAL_SERVER_ERROR,
      message: args.message,
      logging: args.logging,
    });

    err.stack = RestError.getRefiedStack(err);
    return err;
  }

  private constructor({
    code,
    body,
    header,
    status,
    message,
    polyglot,
    logging,
  }: {
    code?: string;
    body?: TBodyType;
    header?: THeaderType;
    status?: number;
    message?: string;
    polyglot?: IPolyglot;
    logging?: Record<string, string>;
  }) {
    super(message ?? polyglot?.id ?? '');

    this.code = code;
    this.body = body;
    this.header = header;
    this.message = message ?? polyglot?.id ?? '';
    this.logging = logging;
    this.polyglot = polyglot;
    this.status = status ?? httpStatusCodes.INTERNAL_SERVER_ERROR;
  }
}

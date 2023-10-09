export type TApiErrorReplyArgs<TDataType = unknown> =
  | {
      code: string;
      message: string;
      translateArgs?: unknown;
      payload?: TDataType;
    }
  | {
      code: string;
      message?: string;
      translateArgs?: unknown;
      payload?: TDataType;
    }
  | {
      code: string;
      message: string;
      translateArgs: unknown;
      payload?: TDataType;
    };

export type TPartialApiErrorReplyArgs<TDataType = unknown> =
  | {
      code?: string;
      message: string;
      translateArgs?: unknown;
      payload?: TDataType;
    }
  | {
      code?: string;
      message?: string;
      translateArgs?: unknown;
      payload?: TDataType;
    };

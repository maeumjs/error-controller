export type TApiErrorReplyArgs<TDataType = unknown> =
  | {
      code: string;
      message: string;
      i18n?: unknown;
      payload?: TDataType;
    }
  | {
      code: string;
      message?: string;
      i18n?: unknown;
      payload?: TDataType;
    }
  | {
      code: string;
      message: string;
      i18n: unknown;
      payload?: TDataType;
    };

export type TPartialApiErrorReplyArgs<TDataType = unknown> =
  | {
      code?: string;
      message: string;
      i18n?: unknown;
      payload?: TDataType;
    }
  | {
      code?: string;
      message?: string;
      i18n?: unknown;
      payload?: TDataType;
    };

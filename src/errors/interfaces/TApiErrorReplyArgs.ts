export type TApiErrorReplyArgs<TDataType = unknown> =
  | {
      code: string;
      message: string;
      i18n?: unknown;
      payload?: TDataType;
      status?: number;
    }
  | {
      code: string;
      message?: string;
      i18n?: unknown;
      payload?: TDataType;
      status?: number;
    }
  | {
      code: string;
      message: string;
      i18n: unknown;
      payload?: TDataType;
      status?: number;
    };

export type TPartialApiErrorReplyArgs<TDataType = unknown> =
  | {
      code?: string;
      message: string;
      i18n?: unknown;
      payload?: TDataType;
      status?: number;
    }
  | {
      code?: string;
      message?: string;
      i18n?: unknown;
      payload?: TDataType;
      status?: number;
    };

export const CE_DI = {
  ERROR_CONTROLLER: 'di-symbol-key-error-controller-error-controller',
} as const;

export type CE_DI = (typeof CE_DI)[keyof typeof CE_DI];

export const CE_MAEUM_DEFAULT_ERROR_HANDLER = {
  BAD_REQUEST: '$$-bad-request',
  REST_ERROR: '$$-rest-error',
  INTERNAL_SERVER_ERROR: '$$-internal-server-error',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_MAEUM_DEFAULT_ERROR_HANDLER =
  typeof CE_MAEUM_DEFAULT_ERROR_HANDLER[keyof typeof CE_MAEUM_DEFAULT_ERROR_HANDLER];

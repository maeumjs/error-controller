export const CE_MAEUM_ERROR_HANDLER_LOCALE_ID = {
  BAD_REQUEST: 'bad_request___schema_validation',
  INTERNAL_SERVER_ERROR: 'internal_server_error___unknown_error',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_MAEUM_ERROR_HANDLER_LOCALE_ID =
  typeof CE_MAEUM_ERROR_HANDLER_LOCALE_ID[keyof typeof CE_MAEUM_ERROR_HANDLER_LOCALE_ID];

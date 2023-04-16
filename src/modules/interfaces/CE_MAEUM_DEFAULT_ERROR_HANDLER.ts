export const CE_MAEUM_DEFAULT_ERROR_HANDLER = {
  DEFAULT_SCHEMA_VALIDATION_ERROR: '$$-default-schema-validation-error',
  DEFAULT_REST_ERROR: '$$-default-rest-error',
  DEFAULT_SERVER_ERROR: '$$-default-server-error',
} as const;

// eslint-disable-next-line @typescript-eslint/no-redeclare, @typescript-eslint/naming-convention
export type CE_MAEUM_DEFAULT_ERROR_HANDLER =
  typeof CE_MAEUM_DEFAULT_ERROR_HANDLER[keyof typeof CE_MAEUM_DEFAULT_ERROR_HANDLER];

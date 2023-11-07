export interface ISchemaErrorReply {
  code?: string;

  message: string;

  validation: Record<
    string,
    { message: string; data?: unknown; schemaPath: string; params?: unknown }
  >;
}

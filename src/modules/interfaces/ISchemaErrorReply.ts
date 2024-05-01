import type { getValidationErrorSummary } from '@maeum/tools';

export interface ISchemaErrorReply {
  code?: string;

  message: string;

  validation: ReturnType<typeof getValidationErrorSummary>;
}

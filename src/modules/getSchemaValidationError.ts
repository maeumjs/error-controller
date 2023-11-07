import type { ISchemaErrorReply } from '#/modules/interfaces/ISchemaErrorReply';
import type { ErrorObject } from 'ajv';

export function getSchemaValidationError(
  errors: (ErrorObject | undefined)[],
): ISchemaErrorReply['validation'] {
  return errors
    .filter((error): error is ErrorObject => error != null)
    .map((error) => ({
      message: error.message ?? 'error occured',
      instancePath: error.instancePath,
      data: error.data,
      schemaPath: error.schemaPath,
      params: error.params,
    }))
    .reduce<ISchemaErrorReply['validation']>((aggregation, error) => {
      return { ...aggregation, [error.instancePath]: error };
    }, {});
}

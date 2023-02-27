import type IMaeumValidationError from '#modules/interfaces/IMaeumValidationError';
import type { ErrorObject } from 'ajv';

export default function getSchemaValidationError(
  errors: (ErrorObject | undefined)[],
): IMaeumValidationError['validation'] {
  return errors
    .filter((error): error is ErrorObject => error != null)
    .map((error) => ({
      message: error.message ?? 'error occured',
      instancePath: error.instancePath,
      data: error.data,
      schemaPath: error.schemaPath,
      params: error.params,
    }))
    .reduce<IMaeumValidationError['validation']>((aggregation, error) => {
      return { ...aggregation, [error.instancePath]: error };
    }, {});
}

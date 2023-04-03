const maeumValidationErrorSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    code: {
      type: 'string',
      description: 'code of error',
    },
    message: {
      type: 'string',
      description: 'description of error',
    },
    validation: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
          },
          data: {},
          schemaPath: {
            type: 'string',
          },
          params: {},
        },
        required: ['message', 'schemaPath'],
      },
      description: 'information of validator result',
    },
  },
  required: ['message', 'validation'],
  $id: 'IMaeumValidationError',
};

export default maeumValidationErrorSchema;

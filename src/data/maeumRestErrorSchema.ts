const maeumRestErrorSchema = {
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
    data: {},
  },
  required: ['message'],
  $id: 'IMaeumValidationError',
};

export default maeumRestErrorSchema;

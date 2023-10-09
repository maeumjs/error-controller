const ApiErrorJsonSchema = {
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
  },
  required: ['message'],
  $id: 'api-error-reply',
};

export default ApiErrorJsonSchema;

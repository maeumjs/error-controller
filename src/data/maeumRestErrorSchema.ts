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
    header: {},
  },
  required: ['message'],
  $id: 'IMaeumRestError',
};

export default maeumRestErrorSchema;

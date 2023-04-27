import RestError from '#errors/RestError';
import extractRestError from '#modules/extractRestError';

describe('extractRestError', () => {
  test('undefined - Error', () => {
    const err = new Error('sample error');
    const restError = extractRestError(err);
    expect(restError).toBeUndefined();
  });

  test('undefined - primitive type', () => {
    expect(extractRestError('no')).toBeUndefined();
    expect(extractRestError(1)).toBeUndefined();
    expect(extractRestError(true)).toBeUndefined();
    expect(extractRestError(Symbol(1))).toBeUndefined();
    expect(extractRestError([1])).toBeUndefined();
  });

  test('undefined - object', () => {
    const restError = extractRestError({ code: 'test-code' });
    expect(restError).toBeUndefined();
  });

  test('RestError - object', () => {
    const restError = extractRestError({ code: 'test-code', message: 'hello world' });
    expect(restError).toMatchObject({ code: 'test-code', message: 'hello world' });
  });

  test('RestError - RestError', () => {
    const err = RestError.create({ code: 'test-code', message: 'hello world' });
    const restError = extractRestError(err);
    expect(restError).toMatchObject({ code: 'test-code', message: 'hello world' });
  });
});

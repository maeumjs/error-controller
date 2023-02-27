import getErrorCode from '#modules/getErrorCode';
import ErrorStackParser from 'error-stack-parser';
import 'jest';

describe('getErrorCode', () => {
  test('pass', () => {
    const code = getErrorCode(new Error(), 'hello');
    const expectation = 'src/modules/__tests__/error.code.test.ts/Object.<anonymous>';
    expect(code).toContain(expectation);
  });

  test('pass - empty stack', () => {
    const spy = jest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => []);
    const code = getErrorCode(new Error(), 'hello');

    spy.mockRestore();

    expect(code).toContain('hello');
  });

  test('pass - empy stack, fallback', () => {
    const spy = jest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => []);
    const code = getErrorCode(new Error());

    spy.mockRestore();

    expect(code).toBeTruthy();
  });

  test('pass - empty stack', () => {
    const spy = jest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => [
      // @ts-expect-error
      {
        fileName: undefined,
        functionName: undefined,
        lineNumber: undefined,
        columnNumber: undefined,
      },
    ]);
    const code = getErrorCode(new Error(), 'hello');

    spy.mockRestore();

    expect(code).toContain('project:///::');
  });

  test('pass - empty stack', () => {
    const spy = jest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => [
      // @ts-expect-error
      {
        fileName: 'fileName',
        functionName: 'functionName',
        lineNumber: 10,
        columnNumber: 20,
      },
    ]);
    const code = getErrorCode(new Error(), 'hello', (value) => `enc:${value}`);

    spy.mockRestore();

    console.log(code);

    expect(code).toContain('enc:project://fileName/functionName:10:20');
  });

  test('catch', () => {
    // @ts-expect-error
    const code = getErrorCode('not expect', 'hello');
    expect(code).toContain('hello');
  });

  test('catch', () => {
    // @ts-expect-error
    const code = getErrorCode('not expect');
    expect(code).toBeTruthy();
  });
});

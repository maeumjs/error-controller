import getSourceLocation from '#modules/getSourceLocation';
import ErrorStackParser from 'error-stack-parser';
import 'jest';

describe('getErrorCode', () => {
  test('pass', () => {
    const code = getSourceLocation(new Error(), 'hello', (c: string) => c);
    const expectation = 'src/modules/__tests__/error.code.test.ts/Object.<anonymous>';
    expect(code).toContain(expectation);
  });

  test('pass - empty stack', () => {
    const spy = jest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => []);
    const code = getSourceLocation(new Error(), 'hello', (c: string) => c);

    spy.mockRestore();

    expect(code).toContain('hello');
  });

  test('pass - empty fallbackcode', () => {
    const spy = jest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => []);
    const code = getSourceLocation(new Error(), undefined, (c: string) => c);

    spy.mockRestore();

    expect(code).toBeTruthy();
  });

  test('pass - empy stack, fallback', () => {
    const spy = jest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => []);
    const code = getSourceLocation(new Error());

    spy.mockRestore();

    expect(code).toBeUndefined();
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
    const code = getSourceLocation(new Error(), 'hello', (c: string) => c);

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
    const code = getSourceLocation(new Error(), 'hello', (value) => `enc:${value}`);

    spy.mockRestore();

    console.log(code);

    expect(code).toContain('enc:project://fileName/functionName:10:20');
  });

  test('catch', () => {
    // @ts-expect-error
    const code = getSourceLocation('not expect', 'hello', (c: string) => c);
    expect(code).toContain('hello');
  });

  test('catch', () => {
    // @ts-expect-error
    const code = getSourceLocation('not expect', undefined, (c: string) => c);
    expect(code).toBeTruthy();
  });

  test('catch', () => {
    // @ts-expect-error
    const code = getSourceLocation('not expect');
    expect(code).toBeUndefined();
  });
});

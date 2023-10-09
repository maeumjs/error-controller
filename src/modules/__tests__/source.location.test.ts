import getSourceLocation from '#/modules/getSourceLocation';
import { describe, expect, it, jest } from '@jest/globals';
import ErrorStackParser from 'error-stack-parser';
import crpyto from 'node:crypto';

describe('getSourceLocation', () => {
  it('plain error', () => {
    const code = getSourceLocation(new Error());
    const expectation = 'src/modules/__tests__/source.location.test.ts/Object.<anonymous>';
    expect(code).toContain(expectation);
  });

  it('parse exception, return fallback', () => {
    const spy = jest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => []);
    const code = getSourceLocation(new Error(), 'hello');
    spy.mockRestore();
    expect(code).toContain('hello');
  });

  it('parse exception, fallback empty', () => {
    const fallback = 'code12345678';
    const spyH01 = jest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => []);
    const spyH02 = jest.spyOn(crpyto, 'randomUUID').mockImplementationOnce(() => fallback);

    const code = getSourceLocation(new Error());

    spyH01.mockRestore();
    spyH02.mockRestore();

    expect(code).toEqual(fallback);
  });

  it('parse success, but stacktrace empty', () => {
    const obj = [
      {
        fileName: undefined,
        functionName: undefined,
        lineNumber: undefined,
        columnNumber: undefined,
      },
    ] as any;
    const spyH = jest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => obj);
    const code = getSourceLocation(new Error(), 'hello');

    spyH.mockRestore();

    expect(code).toContain('project:///::');
  });

  it('catch with fallback', () => {
    const invalid = 'not expect' as any;
    const code = getSourceLocation(invalid, 'hello');
    expect(code).toContain('hello');
  });

  it('catch without fallback', () => {
    const invalid = 'not expect' as any;
    const fallback = 'code12345678';
    const spyH01 = jest.spyOn(crpyto, 'randomUUID').mockImplementationOnce(() => fallback);

    const code = getSourceLocation(invalid);
    spyH01.mockRestore();

    expect(code).toEqual(fallback);
  });
});

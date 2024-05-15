import { getSourceLocation } from '#/modules/getSourceLocation';
import ErrorStackParser from 'error-stack-parser';
import * as crpyto from 'node:crypto';
import { describe, expect, it, vitest } from 'vitest';

vitest.mock('error-stack-parser', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const mod = await importOriginal<typeof import('error-stack-parser')>();
  return {
    ...mod,
  };
});

vitest.mock('node:crypto', async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const mod = await importOriginal<typeof import('node:crypto')>();
  return {
    ...mod,
  };
});

describe('getSourceLocation', () => {
  it('plain error', () => {
    const code = getSourceLocation(new Error());
    const expectation = `project:///${process.cwd()}/src/modules/__tests__/source.location.test.ts:24:36`;
    expect(code).toContain(expectation);
  });

  it('parse exception, return fallback', () => {
    const spy = vitest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => []);
    const code = getSourceLocation(new Error(), 'hello');
    spy.mockRestore();
    expect(code).toContain('hello');
  });

  it('parse exception, fallback empty', () => {
    const fallback = '942627e2-9659-46d5-84f4-4c6902329ea3';
    const spyH01 = vitest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => []);
    const spyH02 = vitest.spyOn(crpyto, 'randomUUID').mockImplementationOnce(() => fallback);

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
    const spyH = vitest.spyOn(ErrorStackParser, 'parse').mockImplementationOnce(() => obj);
    const code = getSourceLocation(new Error(), 'hello');

    spyH.mockRestore();

    expect(code).toContain('project://');
  });

  it('catch with fallback', () => {
    const invalid = 'not expect' as any;
    const code = getSourceLocation(invalid, 'hello');
    expect(code).toContain('hello');
  });

  it('catch without fallback', () => {
    const invalid = 'not expect' as any;
    const fallback = '942627e2-9659-46d5-84f4-4c6902329ea3';
    const spyH01 = vitest.spyOn(crpyto, 'randomUUID').mockImplementationOnce(() => fallback);

    const code = getSourceLocation(invalid);
    spyH01.mockRestore();

    expect(code).toEqual(fallback);
  });
});

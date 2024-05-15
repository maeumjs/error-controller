/* eslint-disable import/no-default-export */
/* eslint-disable import/no-extraneous-dependencies */
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    root: '.',
    include: ['**/src/**/*.test.ts'],
    typecheck: {
      checker: 'tsc',
      tsconfig: './tsconfig.json',
    },
    coverage: {
      enabled: true,
      // provider: 'istanbul', // or 'v8'
      provider: 'v8', // or 'v8'
      exclude: ['src/common/modules/noop.ts'],
      include: ['**/src/**'],
    },
  },
});

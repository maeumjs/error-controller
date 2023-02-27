import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { readFileSync } from 'fs';
import path from 'path';
import readPkg from 'read-pkg';
import dts from 'rollup-plugin-dts';
import { swc } from 'rollup-plugin-swc3';
import ts from 'typescript';

const pkg = readPkg.sync();

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/cjs/index.cjs',
        format: 'cjs',
        sourcemap: false,
      },
      {
        file: 'dist/esm/index.mjs',
        format: 'esm',
        sourcemap: false,
      },
    ],
    plugins: [
      nodeResolve({
        resolveOnly: (module) => {
          return (
            pkg?.dependencies?.[module] != null &&
            pkg?.devDependencies?.[module] != null &&
            pkg?.peerDependencies?.[module] != null
          );
        },
      }),
      typescript({
        tsconfig: 'tsconfig.prod.json',
        compilerOptions: {
          sourceMap: false,
        },
      }),
      swc(),
    ],
  },
  {
    input: 'dist/cjs/src/index.d.ts',
    output: [
      {
        file: 'dist/cjs/index.d.ts',
        format: 'cjs',
      },
      {
        file: 'dist/esm/index.d.ts',
        format: 'esm',
      },
    ],
    plugins: [
      nodeResolve({
        resolveOnly: (module) => {
          return (
            pkg?.dependencies?.[module] != null &&
            pkg?.devDependencies?.[module] != null &&
            pkg?.peerDependencies?.[module] != null
          );
        },
      }),
      dts({
        compilerOptions: {
          baseUrl: 'dist/cjs',
          paths: ts.readConfigFile(path.resolve('./tsconfig.json'), (p) => readFileSync(p, 'utf8'))
            .config.compilerOptions.paths,
        },
      }),
    ],
  },
];

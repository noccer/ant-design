import typescriptPlugin from '@rollup/plugin-typescript';
import typescript from 'typescript';
import { terser as minify } from 'rollup-plugin-terser';
import pluginString from 'rollup-plugin-string';
import pkg from '../package.json';

const input = 'src/index.ts';

const plugins = [
  typescriptPlugin({
    typescript,
    project: '../src/tsconfig.json',
    declaration: false,
  }),
  pluginString.string({
    include: '**/*.graphql',
  }),
  minify(),
];

export default [
  {
    input,
    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
    plugins,
  },
  {
    input,
    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
    plugins,
  },
  // # re-compile to queries TS to inline the query string.
  {
    input: 'src/queries/index.ts',
    output: {
      file: 'lib/queries/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins,
  },
];

import path from 'path'
import postcss from 'rollup-plugin-postcss'
import RollupTypescript from 'rollup-plugin-typescript2'
import { terser } from 'rollup-plugin-terser'
import alias from '@rollup/plugin-alias'
import pkg from './package.json'

const resolveFile = source => path.resolve(__dirname, source)

const externalPackages = [
  'react',
  'react-dom',
  '@tarojs/components',
  '@tarojs/runtime',
  '@tarojs/taro',
  '@tarojs/react',
]

export default {
  input: resolveFile(pkg.source),
  output: [
    {
      file: resolveFile(pkg.main),
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    {
      file: resolveFile(pkg.module),
      format: 'es',
      sourcemap: true,
      exports: 'auto',
    },
  ],
  external: externalPackages,
  plugins: [
    alias({
      entries: [{ find: '@', replacement: resolveFile('src') }],
    }),
    postcss({
      extract: resolveFile(pkg.css),
      minimize: true,
    }),
    RollupTypescript({
      tsconfig: resolveFile('tsconfig.rollup.json'),
    }),
  ],
}

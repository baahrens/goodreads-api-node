import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import pkg from './package.json'


export default {
  input: 'src/index.js',
  output: [
    {
      file: 'dist/goodreads-api-node.umd.js',
      name: 'goodreads-api-node',
      format: 'umd',
    },
    {
      file: 'dist/goodreads-api-node.es.js',
      name: 'goodreads-api-node',
      format: 'es',
    }
  ],
  plugins: [
    commonjs(),
    babel({ exclude: 'node_modules/**' })
  ],
  external: Object.keys(pkg.dependencies)
}


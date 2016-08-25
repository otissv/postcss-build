import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
export default {
  entry: 'src/index.js',
  format: 'cjs',
  plugins: [ babel(), commonjs() ],
  dest: 'lib/index.js'
};

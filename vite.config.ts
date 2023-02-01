import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import inject from '@rollup/plugin-inject'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeModulesPolyfillPlugin(),
        {
          name: 'fix-node-globals-polyfill',
          setup(build) {
            build.onResolve(
              { filter: /_(buffer|virtual-process-polyfill_)\.js/ },
              ({ path }) => ({ path })
            )
          }
        }
      ]
    }
  }
})

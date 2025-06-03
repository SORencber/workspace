import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current directory
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || 'http://localhost:3016'

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      proxy: {
        '/api': {
          target: apiUrl, // Use the API URL from env
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path
        },
        '/logs': {
          target: apiUrl,
          changeOrigin: true,
        }
      },
      allowedHosts: [
        'localhost',
        '.pythagora.ai'
      ],
      watch: {
        ignored: ['**/node_modules/**', '**/dist/**', '**/public/**', '**/log/**']
      }
    },
    build: {
      // Optimize build to reduce memory usage
      sourcemap: false,
      // Chunk size warnings at 500kb
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['/src/components/ui/'],
          }
        }
      }
    },
    optimizeDeps: {
      // Force inclusions for better first-load performance
      include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    }
  }
})
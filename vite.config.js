import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        proxy: {
            '/local-n8n': {
                target: 'http://localhost:5678',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/local-n8n/, ''),
            },
        },
    },
})

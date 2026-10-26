import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api/gas': {
        target: 'https://script.google.com/macros/s/AKfycbxQ-htHTxGtxF3849RFvXAqIkxhjDoglCmq3SccSyAH9oKhboaWZm4Pd0uZxQhDW_tf/exec',
        changeOrigin: true,
        followRedirects: true,
        rewrite: (path) => path.replace(/^\/api\/gas/, ''),
      },
    },
  },
});

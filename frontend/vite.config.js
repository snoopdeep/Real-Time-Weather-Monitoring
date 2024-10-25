import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [reactRefresh()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
});

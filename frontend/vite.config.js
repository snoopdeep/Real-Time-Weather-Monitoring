// import { defineConfig } from 'vite';
// import reactRefresh from '@vitejs/plugin-react';

// export default defineConfig({
//   plugins: [reactRefresh()],
//   server: {
//     proxy: {
//       '/api': 'http://localhost:5000'
//     }
//   },
//   build: {
//     outDir: 'dist', 
//   }
// });

// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
  }
});
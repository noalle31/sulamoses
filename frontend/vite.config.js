import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/sulamoses/',
  plugins: [react()],
  server: {
    port: 5173,
  },
});

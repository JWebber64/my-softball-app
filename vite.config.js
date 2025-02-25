import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // needed for docker
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
  // Enable environment variables
  envDir: './',
  // Define environment variables that should be available in the client
  define: {
    'process.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL),
    'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    'process.env.VITE_WEATHER_API_KEY': JSON.stringify(process.env.VITE_WEATHER_API_KEY),
    'process.env.VITE_OPENCAGE_API_KEY': JSON.stringify(process.env.VITE_OPENCAGE_API_KEY),
    'process.env.OPENAI_API_KEY': JSON.stringify(process.env.OPENAI_API_KEY),
    'process.env.VITE_TESSERACT_LANG_PATH': JSON.stringify(process.env.VITE_TESSERACT_LANG_PATH),
  },
});

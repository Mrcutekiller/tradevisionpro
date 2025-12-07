import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: './', 
    build: {
      outDir: 'dist', // Changed from 'docs' to 'dist' to match Vercel defaults
    },
    define: {
      // This is crucial for Vercel deployment. 
      // It allows process.env.API_KEY to be read from Vercel's Environment Variables settings.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || process.env.API_KEY)
    }
  };
});
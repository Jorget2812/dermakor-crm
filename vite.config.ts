import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3001,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar React y sus dependencias
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Separar Supabase
            'supabase-vendor': ['@supabase/supabase-js'],
            // Separar iconos
            'icons-vendor': ['lucide-react'],
            // Separar utilidades de fecha
            'date-vendor': ['date-fns'],
          }
        }
      },
      // Aumentar el límite de advertencia (temporal, pero reduce warnings)
      chunkSizeWarningLimit: 1000,
      // Mejorar la minificación
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Elimina console.logs en producción
        }
      }
    }
  };
});
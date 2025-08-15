import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  base: '/', // Alterado para raiz absoluta
  build: {
    outDir: '../server/public', // Direto para a pasta do servidor
    emptyOutDir: true, // Limpa o diretório antes de construir
  }
});
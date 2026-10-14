import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public/game',
  server: {
    port: 5173,
    strictPort: true,
    watch: { ignored: ['**/art/**', '**/public/assets/**', '**/docs/**', '**/qa/**'] },
  },
  // Chỉ quét game, không quét các trang kiểm tra asset và Blender portable trong art/.
  optimizeDeps: { entries: ['index.html'], include: ['react', 'react-dom/client', 'phaser'] },
  preview: { port: 4173, strictPort: true },
  // Engine Phaser là một thư viện lớn; UI được tách chunk bằng import động.
  build: { target: 'es2022', chunkSizeWarningLimit: 1300 },
});

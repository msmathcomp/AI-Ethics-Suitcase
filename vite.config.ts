import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { intlayerPlugin } from "vite-intlayer";

// https://vite.dev/config/
export default defineConfig(() => ({
  base: process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : './',
  plugins: [react(), tailwindcss(), intlayerPlugin()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'src'),
      '@': path.resolve(__dirname, '.'),
    },
  },
}))

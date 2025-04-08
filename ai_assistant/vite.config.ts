import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/assistant/',
  // build: {
  //   outDir: 'ai/dist', // 👈 output directory
  // },
  plugins: [react()],
})

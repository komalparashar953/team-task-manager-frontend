import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  preview: {
    allowedHosts: [
      'team-task-manager-frontend-production-3ce2.up.railway.app',
      'localhost'
    ]
  },
  server: {
    host: true,
    port: 5173
  }
})

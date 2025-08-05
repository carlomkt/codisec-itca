import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Removed unnecessary dependency exclusion for better performance
  // lucide-react is a well-optimized library and doesn't need exclusion
});

import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs so the build works from a GitHub Pages subpath (/UI-Project_1/).
  base: './',
  plugins: [svelte()],
})

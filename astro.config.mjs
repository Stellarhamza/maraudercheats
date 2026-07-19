// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  site: 'https://marauderscheats.com',
  trailingSlash: 'always',
  compressHTML: true,

  build: {
      inlineStylesheets: 'auto',
      format: 'directory',
	},

  vite: {
      plugins: [tailwindcss()],
      build: {
          cssMinify: true,
          assetsInlineLimit: 4096,
      },
	},

  adapter: cloudflare(),
});
// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://hlingenieros.com',
  trailingSlash: 'always',
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  build: { format: 'directory' },
  i18n: {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    routing: { prefixDefaultLocale: false },
  },
  // Preact (API de React en ~10 KB): isla del explorador y componentes sin hidratar que Astro compila a HTML.
  integrations: [preact()],
  vite: { plugins: [tailwindcss()] },
});
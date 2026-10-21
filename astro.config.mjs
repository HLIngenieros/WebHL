// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import preact from '@astrojs/preact';
import conocimiento from './src/lib/conocimiento.mjs';

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
  // conocimiento: al compilar, el texto de cada página para el agente (dist/api/conocimiento.json).
  integrations: [preact(), conocimiento()],
  vite: { plugins: [tailwindcss()] },
});
import { defineConfig } from 'vite';
import handler from './api/releases.js';
export default defineConfig({ plugins: [{ name: 'public-release-api', configureServer(server) { server.middlewares.use('/api/releases', (req, res) => handler(req, res)); }, configurePreviewServer(server) { server.middlewares.use('/api/releases', (req, res) => handler(req, res)); } }], build: { rollupOptions: { input: { home: 'index.html', updates: 'updates/index.html', download: 'download/index.html', help: 'help/index.html', privacy: 'privacy/index.html', support: 'support/index.html' } } } });

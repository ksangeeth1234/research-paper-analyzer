import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import express from 'express';
import { apiRouter } from './server/api';

dotenv.config();

const app = express();
app.use(apiRouter);

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-server-middleware',
        configureServer(server) {
          // Mount the Express API app at /api on the Vite dev server
          server.middlewares.use('/api', (req, res, next) => {
            app(req as any, res as any, (err: any) => {
              if (err) {
                console.error('API middleware error:', err);
                if (!res.headersSent) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: err.message || 'Internal server error' }));
                }
              } else {
                if (!res.headersSent) {
                  res.setHeader('Content-Type', 'application/json');
                  res.statusCode = 404;
                  res.end(JSON.stringify({ success: false, error: 'API route not found' }));
                }
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      port: 3000,
      host: '0.0.0.0',
    },
  };
});

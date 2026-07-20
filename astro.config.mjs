// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import svelte from '@astrojs/svelte';
import fs from 'node:fs';
import path from 'node:path';

const isBuild = process.argv.includes('build');
const isStaticBuild = isBuild && !process.env.VERCEL;

const feedbackPath = path.resolve('src/pages/api/feedback.ts');
const feedbackBackupPath = path.resolve('src/pages/api/_feedback.ts');

if (isStaticBuild) {
  if (fs.existsSync(feedbackPath)) {
    fs.renameSync(feedbackPath, feedbackBackupPath);
  }
} else {
  if (fs.existsSync(feedbackBackupPath)) {
    fs.renameSync(feedbackBackupPath, feedbackPath);
  }
}

// https://astro.build/config
export default defineConfig({
  // The `site` property specifies the base URL for your site.
  // Be sure to update this to your own domain (e.g., "https://yourdomain.com") before deploying.
  site: 'https://themewagon.github.io/datanova',
  base: '/datanova',
  output: 'static',
  prefetch: true,
  trailingSlash: 'never',
  experimental: {
    clientPrerender: true,
  },
  integrations: [
    react(),
    markdoc(),
    ...(isStaticBuild || process.env.SKIP_KEYSTATIC ? [] : [keystatic()]),
    svelte(),
    {
      name: 'restore-feedback-api',
      hooks: {
        'astro:build:done': () => {
          if (fs.existsSync(feedbackBackupPath)) {
            fs.renameSync(feedbackBackupPath, feedbackPath);
          }
        },
        'astro:build:error': () => {
          if (fs.existsSync(feedbackBackupPath)) {
            fs.renameSync(feedbackBackupPath, feedbackPath);
          }
        },
      },
    },
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: process.env.VERCEL ? vercel() : undefined,
});

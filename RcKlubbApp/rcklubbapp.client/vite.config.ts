import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

const baseFolder = env.APPDATA ? `${env.APPDATA}/ASP.NET/https` : `${env.HOME}/.aspnet/https`;
const certificateName = 'rcklubbapp.client';
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

if (!fs.existsSync(baseFolder)) fs.mkdirSync(baseFolder, { recursive: true });
if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
  if (child_process.spawnSync('dotnet', ['dev-certs', 'https', '--export-path', certFilePath, '--format', 'Pem', '--no-password'], { stdio: 'inherit' }).status !== 0) {
    throw new Error('Could not create certificate.');
  }
}

const target = env['services__rcklubbapp-server__https__0'] ?? 'https://localhost:7018';

export default defineConfig({
  plugins: [plugin(), tailwindcss()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    proxy: {
      '^/api': { target, secure: false },
      '^/uploads': { target, secure: false },
    },
    port: parseInt(env.DEV_SERVER_PORT || '54028'),
    https: { key: fs.readFileSync(keyFilePath), cert: fs.readFileSync(certFilePath) },
  },
});

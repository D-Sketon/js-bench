import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        os: false,
        v8: false,
      };
    }
    
    config.resolve.alias = {
      ...config.resolve.alias,
      'node:os': 'os',
      'node:process': 'process',
    };

    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.normalModuleFactory.tap('ModuleResolver', (factory) => {
          factory.hooks.beforeResolve.tap('ModuleResolver', (resolveData) => {
            if (resolveData && resolveData.request) {
              if (resolveData.request.startsWith('bun:jsc')) {
                resolveData.request = path.resolve(__dirname, './src/polyfills/bun-jsc.js');
              }
              if (resolveData.request.startsWith('@mitata/counters')) {
                resolveData.request = path.resolve(__dirname, './src/polyfills/mitata-counters.js');
              }
              if (resolveData.request.startsWith('node:')) {
                const moduleName = resolveData.request.replace('node:', '');
                resolveData.request = moduleName;
              }
            }
          });
        });
      },
    });
    
    return config;
  },
  
  experimental: {
    esmExternals: 'loose',
  },
  
  transpilePackages: ['mitata'],
};

export default nextConfig; 
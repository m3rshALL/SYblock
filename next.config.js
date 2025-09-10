/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Enable hot reload in Docker
  webpackDevMiddleware: config => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
  webpack: (config, { isServer }) => {
    // Оптимизация для Monaco Editor
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      }
    }
    
    // Поддержка для Three.js и игровых ресурсов
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      use: ['raw-loader', 'glslify-loader'],
    })
    
    return config
  },
  images: {
    domains: ['localhost'],
  },
}

module.exports = nextConfig 
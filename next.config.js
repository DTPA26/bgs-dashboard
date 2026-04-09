/** @type {import('next').NextConfig} */
const nextConfig = {
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/',
          destination: '/index.html',
        },
      ],
    }
  },
}

module.exports = nextConfig

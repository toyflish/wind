/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/',
        destination: 'https://liveshit.toyflish.com/viana',
        permanent: false,
      },
    ]
  },
}

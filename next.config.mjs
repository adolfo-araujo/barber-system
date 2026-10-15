/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // As imagens das barbearias são servidas diretamente pelo navegador
    // (evita falhas do otimizador com redirecionamentos de CDN externos).
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;

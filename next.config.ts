import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ملاحظة: تم تفعيل فحص ESLint أثناء البناء بعدما كان مُعطّلاً، لأن إخفاء الأخطاء
  // أثناء النشر يعني أن مشاكل الجودة تنزل للإنتاج. أعد تفعيل التجاهل مؤقتاً
  // إذا كنت تنشر بسرعة وتحتاج إلى إصلاح الأخطاء لاحقاً.
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    ],
  },

  output: 'standalone',
  transpilePackages: ['motion'],

  // رؤوس HTTP أمنية (تحسين بسيط لكن مهم).
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },

  webpack: (config, { dev }) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = { ignored: /.*/ };
    }
    return config;
  },
};

export default nextConfig;

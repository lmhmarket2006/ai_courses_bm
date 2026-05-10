import { ImageResponse } from 'next/og';

/** أيقونة PWA/المتصفح — 512 لتلبية متطلبات التثبيت */
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1319b4 0%, #590159 50%, #be1622 100%)',
          color: '#fffbf5',
          fontSize: 220,
          fontWeight: 800,
          letterSpacing: '-0.05em',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        B
      </div>
    ),
    { ...size }
  );
}

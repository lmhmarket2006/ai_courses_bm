import { ImageResponse } from 'next/og';

/** Apple Touch Icon — شاشة الرئيسية على iOS */
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
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
          fontSize: 88,
          fontWeight: 800,
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        B
      </div>
    ),
    { ...size }
  );
}

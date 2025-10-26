import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '8px',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse cx="12" cy="5" rx="9" ry="3" stroke="white" strokeWidth="2"/>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke="white" strokeWidth="2"/>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke="white" strokeWidth="2"/>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}

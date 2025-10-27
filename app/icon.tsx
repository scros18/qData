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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '6px',
          position: 'relative',
        }}
      >
        {/* Terminal window background with emerald accent */}
        <div style={{
          position: 'absolute',
          top: '3px',
          left: '3px',
          right: '3px',
          bottom: '3px',
          background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
          borderRadius: '4px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {/* macOS-style window dots */}
          <div style={{
            position: 'absolute',
            top: '3px',
            left: '4px',
            display: 'flex',
            gap: '2px',
          }}>
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#ef4444', opacity: 0.8 }} />
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#f59e0b', opacity: 0.8 }} />
            <div style={{ width: '3px', height: '3px', borderRadius: '50%', background: '#10b981', opacity: 0.8 }} />
          </div>
          
          {/* Q letter with terminal cursor */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            fontFamily: 'monospace',
            color: '#ecfdf5',
            letterSpacing: '-0.5px',
            marginTop: '2px',
          }}>
            Q<span style={{ 
              width: '2px', 
              height: '14px', 
              background: '#10b981',
              marginLeft: '1px',
              animation: 'blink 1s infinite',
            }} />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}

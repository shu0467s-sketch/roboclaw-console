import React from 'react'

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg shadow-sm"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #0058f5 0%, #003a97 100%)'
      }}
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none">
        <path
          d="M6 3h8.5a4.5 4.5 0 0 1 0 9H10v6H6V3zm4 5h4a1.5 1.5 0 0 0 0-3h-4v3z"
          fill="white"
        />
        <circle cx="17.5" cy="18.5" r="2.5" fill="#FFC52C" />
      </svg>
    </div>
  )
}

export default Logo

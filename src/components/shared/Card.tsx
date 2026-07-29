import React from 'react'

interface CardProps {
  className?: string
  children: React.ReactNode
  onClick?: () => void
  selected?: boolean
  hover?: boolean
}

export function Card({ className = '', children, onClick, selected, hover }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`card p-5 ${onClick ? 'cursor-pointer' : ''} ${selected ? 'ring-2 ring-brand-500 border-brand-300' : ''} ${hover ? 'hover:shadow-cardHover hover:border-slate-300 transition-all' : ''} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card

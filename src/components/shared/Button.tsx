import React from 'react'

type Variant = 'primary' | 'white' | 'ghost' | 'outline' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: string
}

const variantClass: Record<Variant, string> = {
  primary: 'btn-primary',
  white: 'btn-white',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  danger: 'btn-danger'
}

const sizeClass: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-5 py-2.5'
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${variantClass[variant]} ${sizeClass[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button

import React from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  size?: 'sm' | 'md'
}

export function Toggle({ checked, onChange, size = 'md' }: ToggleProps) {
  const w = size === 'sm' ? 'w-9 h-5' : 'w-11 h-6'
  const knob = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4.5 h-4.5'
  const translate = size === 'sm' ? (checked ? 'translate-x-4' : 'translate-x-0.5') : (checked ? 'translate-x-5' : 'translate-x-0.5')
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative ${w} rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-brand-600' : 'bg-slate-300'}`}
      role="switch"
      aria-checked={checked}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 ${knob} ${translate} bg-white rounded-full shadow transition-transform duration-200`}
      />
    </button>
  )
}

export default Toggle

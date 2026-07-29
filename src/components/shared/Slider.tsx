import React from 'react'

interface SliderProps {
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
  color?: string
}

export function Slider({ value, min = 0, max = 100, step = 1, onChange, color = '#0058f5' }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="relative flex items-center">
      <div className="relative w-full h-1.5 rounded-full bg-slate-200">
        <div
          className="absolute h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
        <div
          className="absolute top-1/2 w-4 h-4 -mt-2 -ml-2 bg-white rounded-full shadow-md border border-slate-200 cursor-grab active:cursor-grabbing"
          style={{ left: `${pct}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 w-full opacity-0 cursor-pointer"
      />
    </div>
  )
}

export default Slider

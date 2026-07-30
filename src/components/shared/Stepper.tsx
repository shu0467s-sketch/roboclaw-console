import React from 'react'
import { Icon } from './Icon'

export const STEP_LABELS = [
  '选择业务场景',
  '知识库配置',
  '能力配置',
  '测试发布'
]

interface StepperProps {
  current: number // 0-3
  onStepClick?: (i: number) => void
  maxReached?: number
}

export function Stepper({ current, onStepClick, maxReached = current }: StepperProps) {
  return (
    <div className="flex items-center w-full overflow-x-auto">
      {STEP_LABELS.map((label, i) => {
        const done = i < current
        const active = i === current
        const reachable = i <= maxReached
        return (
          <React.Fragment key={label}>
            <button
              type="button"
              disabled={!reachable || !onStepClick}
              onClick={() => reachable && onStepClick?.(i)}
              className={`flex items-center gap-2 flex-shrink-0 ${reachable && onStepClick ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold border transition-colors
                  ${done ? 'bg-brand-600 border-brand-600 text-white' : ''}
                  ${active ? 'bg-white border-brand-500 text-brand-600 ring-2 ring-brand-100' : ''}
                  ${!done && !active ? 'bg-white border-slate-300 text-slate-400' : ''}
                `}
              >
                {done ? <Icon name="check" className="w-3.5 h-3.5" /> : i + 1}
              </span>
              <span
                className={`text-sm whitespace-nowrap ${active ? 'font-semibold text-slate-800' : done ? 'font-medium text-slate-600' : 'text-slate-400'}`}
              >
                {label}
              </span>
            </button>
            {i < STEP_LABELS.length - 1 && (
              <div className={`flex-1 h-px mx-3 min-w-[16px] ${i < current ? 'bg-brand-500' : 'bg-slate-200'}`} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default Stepper

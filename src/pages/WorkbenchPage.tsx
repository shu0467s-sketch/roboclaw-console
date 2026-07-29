import React from 'react'
import { Icon } from '../components/shared/Icon'
import { Card } from '../components/shared/Card'
import { STEP_LABELS } from '../components/shared/Stepper'
import type { ServicePlan, UserInfo, PageKey, Industry } from '../types'
import { INDUSTRY_LABEL } from '../data/mock'

interface WorkbenchPageProps {
  user: UserInfo
  plans: ServicePlan[]
  onNewPlan: () => void
  onContinuePlan: (p: ServicePlan) => void
  onNavigate: (p: PageKey) => void
}

const STATUS_META: Record<string, { label: string; dot: string; text: string; bg: string }> = {
  running: { label: '运行中', dot: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  draft: { label: '草稿', dot: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-50' },
  abnormal: { label: '异常', dot: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
  offline: { label: '未上线', dot: 'bg-slate-300', text: 'text-slate-400', bg: 'bg-slate-50' }
}

const INDUSTRY_ICON: Record<Industry, string> = {
  hotel: 'building',
  mall: 'tag',
  exhibition: 'chart',
  reception: 'user'
}

export function WorkbenchPage({ user, plans, onNewPlan, onContinuePlan, onNavigate }: WorkbenchPageProps) {
  const runningCount = plans.filter((p) => p.status === 'running').length
  const todayService = plans.reduce((sum, p) => sum + (p.serviceCount || 0), 0)
  const abnormalCount = plans.filter((p) => p.status === 'abnormal').length

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 h-16 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div>
          <span className="text-xs text-slate-400">RoboClaw 机器人服务管理平台</span>
          <h1 className="text-lg font-semibold text-slate-800">工作台</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-emerald-50 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            运行中
          </span>
          <span className="text-sm text-slate-600">{user.isGuest ? '游客体验' : user.name}</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xs font-semibold">
            {user.isGuest ? '客' : user.name.slice(0, 1)}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Hero Banner */}
        <div
          className="relative rounded-2xl overflow-hidden p-8"
          style={{ background: 'linear-gradient(120deg, #003a97 0%, #0058f5 50%, #1e6bff 100%)' }}
        >
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
          <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full" style={{ background: 'radial-gradient(circle, rgba(88,212,255,0.2) 0%, transparent 70%)' }} />

          <div className="relative flex items-center justify-between gap-8">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-white text-xs font-medium mb-4">
                <Icon name="config" className="w-3.5 h-3.5" />
                统一配置流程
              </div>
              <h2 className="text-white text-2xl font-bold leading-snug mb-2">
                从「新建服务方案」开始
              </h2>
              <p className="text-brand-100 text-sm leading-relaxed max-w-lg mb-5">
                按统一流程完成机器人上线准备：选择行业 → 选择业务场景 → 配置能力 → 上传资料 → 空间配置 → 语音配置 → 测试发布。
              </p>
              <div className="flex flex-wrap gap-1.5 mb-6">
                {STEP_LABELS.map((s, i) => (
                  <span key={s} className="text-brand-100 text-xs flex items-center gap-1.5">
                    <span className="text-white/60">{i + 1}</span>
                    {s}
                    {i < STEP_LABELS.length - 1 && <span className="text-white/30 ml-1">›</span>}
                  </span>
                ))}
              </div>
              <button
                onClick={onNewPlan}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white text-brand-700 rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                <Icon name="plus" className="w-4 h-4" />
                新建服务方案
              </button>
            </div>
            <div className="hidden xl:flex items-center justify-center w-48 h-48 flex-shrink-0">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-white/10 animate-pulse" style={{ animationDuration: '3s' }} />
                <Icon name="robot" className="w-32 h-32 text-white/90 relative" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: '运行中服务', value: runningCount, unit: '个', icon: 'rocket', color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: '今日服务次数', value: todayService, unit: '次', icon: 'message', color: 'text-brand-600', bg: 'bg-brand-50' },
            { label: '异常提醒', value: abnormalCount, unit: '条', icon: 'alert', color: 'text-amber-600', bg: 'bg-amber-50', highlight: abnormalCount > 0 },
            { label: '最近修改', value: '刚刚', unit: '', icon: 'clock', color: 'text-violet-600', bg: 'bg-violet-50', isText: true }
          ].map((s) => (
            <Card key={s.label} className={s.highlight ? 'ring-1 ring-amber-200 bg-amber-50/40' : ''}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                  <Icon name={s.icon} className={`w-5 h-5 ${s.color}`} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">{s.label}</div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-slate-800">{s.value}</span>
                    {s.unit && <span className="text-xs text-slate-400">{s.unit}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Service list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">我的机器人服务</h3>
            <span className="text-sm text-slate-400">共 {plans.length} 个方案</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* New plan card - always first */}
            <button
              onClick={onNewPlan}
              className="group card p-6 border-dashed border-2 border-brand-200 hover:border-brand-400 hover:bg-brand-50/40 transition-all text-left"
            >
              <div className="flex flex-col items-center justify-center h-full py-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 group-hover:bg-brand-100 flex items-center justify-center mb-3 transition-colors">
                  <Icon name="plus" className="w-7 h-7 text-brand-600" />
                </div>
                <div className="text-base font-semibold text-slate-800 mb-1">新建服务方案</div>
                <div className="text-xs text-slate-400 text-center max-w-[180px]">
                  从选择行业开始，按统一流程完成机器人服务上线
                </div>
              </div>
            </button>

            {/* Existing plans */}
            {plans.map((plan) => {
              const meta = STATUS_META[plan.status]
              return (
                <Card key={plan.id} hover className="p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Icon name={INDUSTRY_ICON[plan.industry]} className="w-4.5 h-4.5 text-slate-600" />
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">{INDUSTRY_LABEL[plan.industry]} · {plan.scenario}</span>
                      </div>
                    </div>
                    <span className={`badge ${meta.bg} ${meta.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
                      {meta.label}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-800 mb-3 line-clamp-1">{plan.name}</h4>

                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">配置进度</span>
                      <span className="text-slate-600 font-medium">{plan.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${plan.progress === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                        style={{ width: `${plan.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <Icon name="clock" className="w-3 h-3" />
                      {plan.lastModified}
                    </span>
                    {plan.onlineDuration && (
                      <span className="flex items-center gap-1">
                        <Icon name="history" className="w-3 h-3" />
                        {plan.onlineDuration}
                      </span>
                    )}
                    {plan.robotId && (
                      <span className="flex items-center gap-1">
                        <Icon name="robot" className="w-3 h-3" />
                        {plan.robotId}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex gap-2">
                    <button
                      onClick={() => onContinuePlan(plan)}
                      className="flex-1 btn-outline text-xs py-1.5"
                    >
                      {plan.progress < 100 ? '继续配置' : '编辑方案'}
                    </button>
                    {plan.status === 'running' && (
                      <button
                        onClick={() => onNavigate('operation')}
                        className="flex-1 btn-ghost text-xs py-1.5 border border-slate-200"
                      >
                        查看运行
                      </button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkbenchPage

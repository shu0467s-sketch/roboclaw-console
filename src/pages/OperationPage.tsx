import React, { useState } from 'react'
import { Icon } from '../components/shared/Icon'
import { Card } from '../components/shared/Card'
import { Button } from '../components/shared/Button'
import { Modal } from '../components/shared/Modal'
import type { PageKey, ServicePlan, VersionRecord } from '../types'
import { OPERATION_KPIS, ALERTS, RUN_LOGS, VERSIONS } from '../data/mock'

type TabKey = 'overview' | 'analytics' | 'version'

interface OperationPageProps {
  plans: ServicePlan[]
  onNavigate: (p: PageKey) => void
}

export function OperationPage({ plans, onNavigate }: OperationPageProps) {
  const [tab, setTab] = useState<TabKey>('overview')
  const [compareOpen, setCompareOpen] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<string[]>(['v3', 'v2'])

  const runningPlan = plans.find((p) => p.status === 'running')

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 h-16 bg-white border-b border-slate-200 sticky top-0 z-10">
        <div>
          <span className="text-xs text-slate-400">RoboClaw 机器人服务管理平台</span>
          <h1 className="text-lg font-semibold text-slate-800">上线运营</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="badge bg-emerald-50 text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            运行中
          </span>
          <span className="text-sm text-slate-600">运营主管</span>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto space-y-6">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
          {[
            { key: 'overview', label: '运行概览' },
            { key: 'analytics', label: '数据分析' },
            { key: 'version', label: '版本管理' }
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as TabKey)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'overview' && <OverviewTab plans={plans} />}
        {tab === 'analytics' && <AnalyticsTab />}
        {tab === 'version' && <VersionTab onCompare={() => setCompareOpen(true)} />}
      </div>

      <Modal
        open={compareOpen}
        onClose={() => setCompareOpen(false)}
        title="版本差异对比"
        subtitle="选择两个版本进行对比，查看配置变化对服务效果的影响。"
      >
        <div className="space-y-3">
          {VERSIONS.map((v) => (
            <label key={v.id} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={selectedVersions.includes(v.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedVersions((prev) => [...prev.slice(-1), v.id])
                  } else {
                    setSelectedVersions((prev) => prev.filter((id) => id !== v.id))
                  }
                }}
                disabled={selectedVersions.includes(v.id) && selectedVersions.length === 2}
                className="w-4 h-4 rounded border-slate-300 text-brand-600"
              />
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-800">{v.version}</div>
                <div className="text-xs text-slate-500">{v.changes}</div>
              </div>
            </label>
          ))}
          {selectedVersions.length === 2 && (
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-2">
              <div className="font-medium text-slate-700">差异摘要</div>
              <div className="text-slate-500 text-xs">
                {VERSIONS.find((v) => v.id === selectedVersions[1])?.version} → {VERSIONS.find((v) => v.id === selectedVersions[0])?.version}
              </div>
              <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                <li>更新了酒店介绍资料与 FAQ 内容</li>
                <li>调整了地图点位和导航路线</li>
                <li>音量和欢迎语措辞微调</li>
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

function OverviewTab({ plans }: { plans: ServicePlan[] }) {
  return (
    <>
      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
        {OPERATION_KPIS.map((kpi) => {
          const isAlert = kpi.alert
          const t = kpi.trend || []
          const tMax = Math.max(...t)
          const tMin = Math.min(...t)
          const tRange = tMax - tMin || 1
          return (
            <Card key={kpi.label} className={`p-4 ${isAlert ? 'ring-1 ring-amber-200 bg-amber-50/40' : ''}`}>
              <div className="text-xs text-slate-500 mb-1">{kpi.label}</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-xl font-bold text-slate-800">{kpi.value}</span>
                {kpi.unit && <span className="text-xs text-slate-400">{kpi.unit}</span>}
              </div>
              {t.length > 0 && (
                <div className="flex items-end gap-0.5 h-8">
                  {t.map((v, i) => {
                    const h = ((v - tMin) / tRange) * 100
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t-sm ${isAlert ? 'bg-amber-300' : 'bg-brand-400'}`}
                        style={{ height: `${Math.max(h, 15)}%` }}
                      />
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trend */}
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs text-brand-600 font-medium">服务运行情况</div>
              <h3 className="text-base font-semibold text-slate-800">近七日趋势</h3>
            </div>
            <span className="badge bg-amber-50 text-amber-600">有 {ALERTS.length} 条提醒</span>
          </div>
          <div className="h-56 flex items-end gap-3">
            {(() => {
              const data = [32, 38, 42, 48, 45, 52, 58]
              const dMax = Math.max(...data)
              const dMin = Math.min(...data)
              const dRange = dMax - dMin || 1
              return data.map((v, i) => {
                const h = 40 + ((v - dMin) / dRange) * 60
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full bg-gradient-to-t from-brand-600 to-brand-400 rounded-t-lg opacity-90 group-hover:opacity-100 transition-opacity" style={{ height: `${h}%` }} />
                    <span className="text-xs text-slate-400">{['周一', '周二', '周三', '周四', '周五', '周六', '周日'][i]}</span>
                  </div>
                )
              })
            })()}
          </div>

          {/* Alert */}
          <div className="mt-5 p-4 rounded-xl bg-amber-50 border border-amber-100">
            <div className="flex items-start gap-3">
              <Icon name="alert" className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-semibold text-slate-800">状态提醒</div>
                <p className="text-sm text-slate-600 mt-1">{ALERTS[0]?.message}</p>
              </div>
            </div>
          </div>

          {/* Run log */}
          <div className="mt-5">
            <div className="text-sm font-semibold text-slate-800 mb-3">运行记录</div>
            <div className="space-y-3">
              {RUN_LOGS.map((log) => (
                <div key={log.id} className="flex items-start gap-3 text-sm">
                  <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${log.type === 'error' ? 'bg-rose-500' : log.type === 'version' ? 'bg-brand-500' : 'bg-emerald-500'}`} />
                  <div className="flex-1">
                    <span className="text-slate-500 text-xs mr-2">{log.time}</span>
                    <span className="text-slate-700">{log.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Analytics entry */}
        <Card className="p-5">
          <div className="text-xs text-brand-600 font-medium mb-1">数据分析入口</div>
          <h3 className="text-base font-semibold text-slate-800 mb-2">进入数据分析中心</h3>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            查看更多业务数据分析能力。当前先保留入口和占位页面，深度筛选、导出和自助分析后续单独开发。
          </p>
          <Button onClick={() => {}} className="w-full justify-center">
            进入数据分析中心
          </Button>

          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="text-sm font-semibold text-slate-800 mb-3">当前运行版本</div>
            {VERSIONS.filter((v) => v.isCurrent).map((v) => (
              <div key={v.id} className="p-3 rounded-lg bg-slate-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-800">{v.version}</span>
                  <span className="badge bg-emerald-50 text-emerald-600">运行中</span>
                </div>
                <div className="text-xs text-slate-500">{v.publishedAt} · {v.publisher}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}

function AnalyticsTab() {
  return (
    <Card className="p-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
        <Icon name="chart" className="w-8 h-8 text-brand-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">数据分析中心</h3>
      <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
        后续将支持经营概览、场景对比、机器人设备表现、用户问题分析、回答质量分析、资料效果分析、导航任务分析等能力。当前仅保留入口。
      </p>
      <Button variant="white" onClick={() => {}}>查看数据口径说明</Button>
    </Card>
  )
}

function VersionTab({ onCompare }: { onCompare: () => void }) {
  const [recoverOpen, setRecoverOpen] = useState(false)
  const [recoverVersion, setRecoverVersion] = useState<VersionRecord | null>(null)

  return (
    <>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-semibold text-slate-800">历史发布版本</h3>
            <p className="text-sm text-slate-500 mt-1">包含当前运行版本、历史发布版本、修改记录、版本差异对比和恢复历史版本。</p>
          </div>
          <Button variant="outline" onClick={onCompare}>
            <Icon name="copy" className="w-4 h-4" />
            版本差异对比
          </Button>
        </div>

        <div className="space-y-3">
          {VERSIONS.map((v) => (
            <div key={v.id} className={`flex items-start gap-4 p-4 rounded-xl border ${v.isCurrent ? 'border-brand-200 bg-brand-50/40' : 'border-slate-200'}`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${v.isCurrent ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Icon name="history" className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-slate-800">{v.version}</span>
                  {v.isCurrent && <span className="badge bg-emerald-50 text-emerald-600">当前运行</span>}
                </div>
                <div className="text-xs text-slate-500 mb-2">{v.publishedAt} · 发布人：{v.publisher}</div>
                <p className="text-sm text-slate-600">{v.changes}</p>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-sm font-semibold text-slate-800">{v.serviceCount} 次</div>
                <div className="text-xs text-slate-500">服务次数</div>
                <div className="text-sm font-semibold text-slate-800 mt-1">{v.satisfaction} 分</div>
                <div className="text-xs text-slate-500">满意度</div>
              </div>
              {!v.isCurrent && (
                <button
                  onClick={() => { setRecoverVersion(v); setRecoverOpen(true) }}
                  className="btn-outline text-xs self-start"
                >
                  恢复版本
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Modal
        open={recoverOpen}
        onClose={() => setRecoverOpen(false)}
        title="恢复历史版本"
        subtitle="恢复后当前运行版本将被替换，机器人服务会按历史版本配置运行。"
        footer={
          <>
            <Button variant="white" onClick={() => setRecoverOpen(false)}>取消</Button>
            <Button onClick={() => setRecoverOpen(false)}>确认恢复</Button>
          </>
        }
      >
        <p className="text-sm text-slate-500">
          确认恢复到 <span className="font-semibold text-slate-800">{recoverVersion?.version}</span>？该版本发布于 {recoverVersion?.publishedAt}，{recoverVersion?.changes}
        </p>
      </Modal>
    </>
  )
}

export default OperationPage

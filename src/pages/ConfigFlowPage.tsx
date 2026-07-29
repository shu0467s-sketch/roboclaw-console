import React, { useState, useMemo } from 'react'
import { Stepper } from '../components/shared/Stepper'
import { Icon } from '../components/shared/Icon'
import { Button } from '../components/shared/Button'
import { Card } from '../components/shared/Card'
import { Toggle } from '../components/shared/Toggle'
import { Slider } from '../components/shared/Slider'
import { Modal } from '../components/shared/Modal'
import type { Industry, DraftConfig } from '../types'
import {
  INDUSTRIES,
  INDUSTRY_LABEL,
  CAPABILITIES,
  MATERIALS,
  SYSTEMS,
  VOICES,
  DEFAULT_WELCOME,
  DEFAULT_POINTS,
  ROBOTS,
  getChecklist,
  getChatResponse,
  CHAT_PRESETS,
  CHAT_RESPONSES
} from '../data/mock'

interface ConfigFlowPageProps {
  draft: DraftConfig
  setDraft: React.Dispatch<React.SetStateAction<DraftConfig>>
  isGuest: boolean
  onPublish: (name: string, industry: Industry, scenario: string, robotId: string) => void
  onBack: () => void
}

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: '待上传', color: 'text-slate-500', bg: 'bg-slate-100' },
  parsing: { label: '解析中', color: 'text-amber-600', bg: 'bg-amber-50' },
  done: { label: '已完成', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  'need-fix': { label: '需修改', color: 'text-rose-600', bg: 'bg-rose-50' }
}

export function ConfigFlowPage({ draft, setDraft, isGuest, onPublish, onBack }: ConfigFlowPageProps) {
  const [maxReached, setMaxReached] = useState(draft.step)
  const [publishOpen, setPublishOpen] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)

  const currentStep = draft.step
  const industry = draft.industry
  const scenario = draft.scenario

  const setStep = (i: number) => {
    setDraft((d) => ({ ...d, step: i }))
  }

  const next = () => {
    const n = Math.min(currentStep + 1, 6)
    setDraft((d) => ({ ...d, step: n }))
    setMaxReached((m) => Math.max(m, n))
  }

  const prev = () => {
    setDraft((d) => ({ ...d, step: Math.max(d.step - 1, 0) }))
  }

  const selectIndustry = (ind: Industry) => {
    const welcome = DEFAULT_WELCOME[ind]
    setDraft((d) => ({
      ...d,
      industry: ind,
      scenario: INDUSTRIES.find((x) => x.value === ind)?.scenarios[0] || '',
      materials: MATERIALS[ind].map((m) => ({ ...m })),
      voice: { ...d.voice, welcomeMsg: welcome || d.voice.welcomeMsg },
      capabilities: CAPABILITIES.filter((c) => c.defaultOn).map((c) => c.id),
      points: DEFAULT_POINTS,
      step: 1
    }))
    setMaxReached((m) => Math.max(m, 1))
  }

  const selectScenario = (s: string) => {
    setDraft((d) => ({ ...d, scenario: s, step: 2 }))
    setMaxReached((m) => Math.max(m, 2))
  }

  const toggleCapability = (id: string) => {
    setDraft((d) => ({
      ...d,
      capabilities: d.capabilities.includes(id)
        ? d.capabilities.filter((c) => c !== id)
        : [...d.capabilities, id]
    }))
  }

  const updateMaterialStatus = (id: string, status: string, size?: string) => {
    setDraft((d) => ({
      ...d,
      materials: d.materials.map((m) => (m.id === id ? { ...m, status, size, parseResult: status === 'done' ? '解析成功，可用于机器人回答。' : m.parseResult } : m))
    }))
  }

  const toggleSystem = (id: string) => {
    // Systems are read-only; we just show the mock state.
  }

  const addPoint = (x: number, y: number) => {
    const names = ['大堂入口', '服务台', '餐厅', '电梯口', '会议室', '洗手间', '出口', '活动区']
    const baseName = names[(draft.points.length + 3) % names.length]
    setDraft((d) => ({
      ...d,
      points: [...d.points, { id: `p-${Date.now()}`, name: baseName, type: '关键地点', x, y }]
    }))
  }

  const updatePoint = (id: string, patch: Partial<DraftConfig['points'][0]>) => {
    setDraft((d) => ({
      ...d,
      points: d.points.map((p) => (p.id === id ? { ...p, ...patch } : p))
    }))
  }

  const deletePoint = (id: string) => {
    setDraft((d) => ({ ...d, points: d.points.filter((p) => p.id !== id) }))
  }

  const currentIndustry = useMemo(() => INDUSTRIES.find((i) => i.value === industry), [industry])
  const availableScenarios = currentIndustry?.scenarios || []

  const currentIndustryData = industry ? INDUSTRIES.find((i) => i.value === industry) : null

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-slate-50">
      {/* Header */}
      <div className="flex items-center justify-between px-8 h-16 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <Icon name="arrowLeft" className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs text-slate-400">RoboClaw 机器人服务管理平台</span>
            <h1 className="text-lg font-semibold text-slate-800">方案配置</h1>
          </div>
        </div>
        {industry && (
          <div className="hidden md:flex items-center gap-2 text-sm text-slate-500">
            <span className="px-2 py-1 rounded-md bg-slate-100">{INDUSTRY_LABEL[industry]}</span>
            <Icon name="chevronRight" className="w-3.5 h-3.5" />
            <span className="px-2 py-1 rounded-md bg-slate-100">{scenario || '选择业务场景'}</span>
          </div>
        )}
      </div>

      {/* Stepper bar - fixed under header */}
      <div className="px-8 py-3 bg-white border-b border-slate-100 flex-shrink-0">
        <div className="max-w-[1200px] mx-auto">
          <Stepper current={currentStep} maxReached={maxReached} onStepClick={setStep} />
        </div>
      </div>

      {/* Main content - independent scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto p-8">
        <div className="max-w-[1200px] mx-auto">
          <Card className="min-h-[420px] p-6">
            {currentStep === 0 && (
              <IndustryStep industry={industry} onSelect={selectIndustry} />
            )}
            {currentStep === 1 && currentIndustry && (
              <ScenarioStep industry={currentIndustry} scenario={scenario} onSelect={selectScenario} />
            )}
            {currentStep === 2 && (
              <CapabilityStep capabilities={draft.capabilities} onToggle={toggleCapability} />
            )}
            {currentStep === 3 && industry && (
              <MaterialStep materials={draft.materials} systems={SYSTEMS[industry]} onUpload={updateMaterialStatus} />
            )}
            {currentStep === 4 && (
              <MapStep points={draft.points} onAdd={addPoint} onUpdate={updatePoint} onDelete={deletePoint} />
            )}
            {currentStep === 5 && industry && (
              <VoiceStep voice={draft.voice} industry={industry} onChange={(v) => setDraft((d) => ({ ...d, voice: { ...d.voice, ...v } }))} />
            )}
            {currentStep === 6 && industry && (
              <TestPublishStep
                industry={industry}
                scenario={scenario}
                capabilities={draft.capabilities}
                materials={draft.materials}
                points={draft.points}
                welcomeMsg={draft.voice.welcomeMsg}
                robotId={draft.robotId}
                isGuest={isGuest}
                onRobotChange={(id) => setDraft((d) => ({ ...d, robotId: id }))}
                onPublish={() => setPublishOpen(true)}
                onSaveDraft={() => setDraftSaved(true)}
              />
            )}
          </Card>
        </div>
      </div>

      {/* Footer actions - fixed bottom */}
      <div className="px-8 py-4 bg-white border-t border-slate-200 flex-shrink-0">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <button onClick={() => setDraftSaved(true)} className="btn-ghost text-sm">
            <Icon name="download" className="w-4 h-4" />
            保存草稿
          </button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button variant="white" onClick={prev}>
                上一步
              </Button>
            )}
            {currentStep < 6 && (
              <Button onClick={next}>
                下一步
              </Button>
            )}
            {currentStep === 6 && (
              <Button onClick={() => setPublishOpen(true)} disabled={isGuest}>
                {isGuest ? '游客不可发布' : '发布上线'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        title="发布服务方案"
        subtitle="发布后机器人将按照当前配置开始服务。游客模式下无法真实发布。"
        footer={
          <>
            <Button variant="white" onClick={() => setPublishOpen(false)}>取消</Button>
            <Button
              onClick={() => {
                if (isGuest) return
                if (industry) {
                  onPublish(draft.planName, industry, scenario, draft.robotId)
                }
                setPublishOpen(false)
              }}
              disabled={isGuest}
            >
              {isGuest ? '游客不可发布' : '发布上线'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="label">方案名称</label>
            <input
              className="input"
              value={draft.planName}
              onChange={(e) => setDraft((d) => ({ ...d, planName: e.target.value }))}
              placeholder="例如：悦澜酒店前台接待"
            />
          </div>
          <div>
            <label className="label">发布到机器人</label>
            <select
              className="input"
              value={draft.robotId}
              onChange={(e) => setDraft((d) => ({ ...d, robotId: e.target.value }))}
            >
              {ROBOTS.map((r) => (
                <option key={r.id} value={r.id}>{r.name} · {r.location}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between"><span>行业</span><span className="text-slate-700 font-medium">{industry ? INDUSTRY_LABEL[industry] : '-'}</span></div>
            <div className="flex justify-between"><span>场景</span><span className="text-slate-700 font-medium">{scenario || '-'}</span></div>
            <div className="flex justify-between"><span>能力</span><span className="text-slate-700 font-medium">已开启 {draft.capabilities.length} 项</span></div>
          </div>
        </div>
      </Modal>

      <Modal open={draftSaved} onClose={() => setDraftSaved(false)} title="草稿已保存" width="max-w-sm">
        <p className="text-sm text-slate-500">当前配置已暂存到本地状态，您可随时返回继续编辑。</p>
      </Modal>
    </div>
  )
}

function IndustryStep({ industry, onSelect }: { industry: Industry | null; onSelect: (i: Industry) => void }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">选择行业</h2>
        <p className="text-sm text-slate-500">先选择机器人将服务的行业，系统会自动带出该行业下常见业务场景和推荐配置。</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {INDUSTRIES.map((ind) => {
          const selected = industry === ind.value
          return (
            <Card
              key={ind.value}
              selected={selected}
              hover
              onClick={() => onSelect(ind.value)}
              className="relative h-full"
            >
              {selected && (
                <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center">
                  <Icon name="check" className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="text-xs font-medium mb-2">
                <span className={`${selected ? 'text-brand-600' : 'text-slate-500'}`}>
                  {selected ? '已选' : '未选'}
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-2">{ind.label}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{ind.desc}</p>
              <div className="text-xs text-slate-400">
                <div className="font-medium text-slate-600 mb-1">常见业务场景</div>
                <div className="flex flex-wrap gap-1">
                  {ind.scenarios.map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100">{s}</span>
                  ))}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function ScenarioStep({ industry, scenario, onSelect }: { industry: typeof INDUSTRIES[0]; scenario: string; onSelect: (s: string) => void }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">选择业务场景</h2>
        <p className="text-sm text-slate-500">在{industry.label}行业下选择机器人要承担的具体服务任务。不同业务场景会使用不同能力组合、资料清单和测试问题。</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {industry.scenarios.map((s) => {
          const selected = scenario === s
          return (
            <Card key={s} selected={selected} hover onClick={() => onSelect(s)}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-800">{s}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${selected ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                  {selected ? '已选' : '未选'}
                </span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                适用于{industry.label}场景下{s}相关任务，系统会推荐该场景下的默认能力组合与资料清单。
              </p>
              <div className="text-xs text-slate-400">
                <div className="font-medium text-slate-600 mb-1">默认能力</div>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 rounded bg-slate-100">主动欢迎</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100">回答问题</span>
                </div>
              </div>
            </Card>
          )
        })}
        <div className="card p-5 border-dashed border-slate-200 flex flex-col justify-center">
          <div className="text-sm text-slate-500 mb-1">没有你想要的场景？</div>
          <div className="text-xs text-slate-400 mb-3">联系技术支持，为你的业务评估专属方案。</div>
          <button className="btn-outline text-xs self-start">联系技术支持</button>
        </div>
      </div>
    </div>
  )
}

function CapabilityStep({ capabilities, onToggle }: { capabilities: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">能力配置</h2>
        <p className="text-sm text-slate-500">这里按「机器人可以做什么」组织，不展示技术参数。推荐能力已默认开启。</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {CAPABILITIES.map((cap) => {
          const on = capabilities.includes(cap.id)
          return (
            <Card
              key={cap.id}
              selected={on}
              hover
              onClick={() => onToggle(cap.id)}
              className="relative"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded">{cap.category}</span>
                <Toggle checked={on} onChange={() => onToggle(cap.id)} />
              </div>
              <h3 className="text-base font-semibold text-slate-800 mb-1">{cap.name}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">{cap.desc}</p>
              <div className="text-xs text-slate-400 flex items-center gap-1">
                {cap.recommended && <span className="text-emerald-600 font-medium">推荐</span>}
                {cap.recommendFor && <span className="text-brand-600 font-medium">{cap.recommendFor}</span>}
                {!cap.recommended && !cap.recommendFor && <span className="text-slate-400">可选</span>}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function MaterialStep({
  materials,
  systems,
  onUpload
}: {
  materials: DraftConfig['materials']
  systems: typeof SYSTEMS['hotel']
  onUpload: (id: string, status: string, size?: string) => void
}) {
  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">上传业务资料</h2>
          <p className="text-sm text-slate-500">可上传资料，也可连接已有系统。上传后展示解析状态、结果和修改建议。</p>
        </div>
        <button className="btn-white text-sm">
          <Icon name="download" className="w-4 h-4" />
          下载资料样表
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="text-sm font-medium text-slate-700 mb-3">上传资料</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {materials.map((m) => {
              const meta = STATUS_MAP[m.status] || STATUS_MAP.pending
              return (
                <Card key={m.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-semibold text-slate-800">{m.name}</h4>
                    <span className={`badge ${meta.bg} ${meta.color}`}>{meta.label}</span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{m.desc}</p>
                  {m.status === 'done' ? (
                    <div className="text-xs text-emerald-600 bg-emerald-50 rounded-lg p-2 mb-3">
                      {m.parseResult}
                    </div>
                  ) : null}
                  {m.size && <div className="text-[11px] text-slate-400 mb-2">{m.size}</div>}
                  {m.status !== 'done' ? (
                    <button
                      onClick={() => onUpload(m.id, 'parsing')}
                      className="btn-outline text-xs w-full justify-center"
                    >
                      <Icon name="upload" className="w-3.5 h-3.5" />
                      {m.status === 'parsing' ? '解析中...' : '点击模拟上传文件'}
                    </button>
                  ) : (
                    <button
                      onClick={() => onUpload(m.id, 'pending')}
                      className="btn-ghost text-xs w-full justify-center border border-slate-200"
                    >
                      重新上传
                    </button>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-3">连接已有系统</div>
          <div className="space-y-3">
            {systems.map((sys) => (
              <Card key={sys.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-1">{sys.name}</h4>
                    <p className="text-xs text-slate-500">{sys.desc}</p>
                  </div>
                  <Toggle checked={sys.connected} onChange={() => {}} />
                </div>
                <div className={`text-xs mt-3 ${sys.connected ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {sys.status}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function MapStep({
  points,
  onAdd,
  onUpdate,
  onDelete
}: {
  points: DraftConfig['points']
  onAdd: (x: number, y: number) => void
  onUpdate: (id: string, patch: Partial<DraftConfig['points'][0]>) => void
  onDelete: (id: string) => void
}) {
  const [testResult, setTestResult] = useState<string | null>(null)
  const mapRef = React.useRef<HTMLDivElement>(null)

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    if (x >= 0 && x <= 100 && y >= 0 && y <= 100) onAdd(x, y)
  }

  const testRoute = () => {
    if (points.length < 2) {
      setTestResult('地点数量不足，请至少设置两个地点后再测试路线。')
      return
    }
    const seconds = Math.round(points.length * 12 + Math.random() * 20)
    setTestResult(`导航测试：路线可达，预计${seconds}秒到达。`)
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">空间配置</h2>
        <p className="text-sm text-slate-500">地图与点位仍属于统一配置流程。点击地图添加地点，右侧可修改、删除并测试路线。</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div
            ref={mapRef}
            onClick={handleMapClick}
            className="relative w-full h-[420px] rounded-xl border border-slate-200 bg-white overflow-hidden cursor-crosshair"
            style={{
              backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          >
            {/* Decorative walls */}
            <div className="absolute left-[10%] top-[15%] w-[35%] h-[25%] border-2 border-slate-300 rounded-lg" />
            <div className="absolute left-[50%] top-[10%] w-[30%] h-[30%] border-2 border-slate-300 rounded-lg" />
            <div className="absolute left-[15%] top-[55%] w-[55%] h-[30%] border-2 border-slate-300 rounded-lg" />

            {points.map((p) => (
              <div
                key={p.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <div className="px-2.5 py-1 rounded-full bg-brand-600 text-white text-xs font-medium shadow-md whitespace-nowrap">
                  {p.name}
                </div>
                <div className="w-2 h-2 rounded-full bg-brand-400 mt-1" />
              </div>
            ))}
          </div>
          <div className="text-xs text-slate-400 mt-2">提示：点击地图空白处即可添加新的地点。</div>
        </div>

        <div>
          <div className="text-sm font-medium text-slate-700 mb-3">地点设置</div>
          <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
            {points.map((p) => (
              <Card key={p.id} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    className="input flex-1 text-sm py-1.5"
                    value={p.name}
                    onChange={(e) => onUpdate(p.id, { name: e.target.value })}
                  />
                  <button onClick={() => onDelete(p.id)} className="btn-danger">删除</button>
                </div>
                <select
                  className="input text-sm py-1.5"
                  value={p.type}
                  onChange={(e) => onUpdate(p.id, { type: e.target.value as any })}
                >
                  <option>入口</option>
                  <option>服务点</option>
                  <option>关键地点</option>
                  <option>出口</option>
                </select>
              </Card>
            ))}
            {points.length === 0 && (
              <div className="text-sm text-slate-400 text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                暂无地点，请在左侧地图点击添加
              </div>
            )}
          </div>
          <button onClick={testRoute} className="btn-primary w-full mt-4 justify-center">
            <Icon name="play" className="w-4 h-4" />
            测试路线
          </button>
          {testResult && (
            <div className="mt-3 text-sm text-brand-700 bg-brand-50 rounded-lg p-3">
              {testResult}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function VoiceStep({
  voice,
  industry,
  onChange
}: {
  voice: DraftConfig['voice']
  industry: Industry
  onChange: (v: Partial<DraftConfig['voice']>) => void
}) {
  const recommendStyle = industry === 'hotel' ? '亲切、稳重' : industry === 'mall' ? '热情、有活力' : '清晰、专业'
  const [listening, setListening] = useState(false)

  const handleListen = () => {
    setListening(true)
    setTimeout(() => {
      setListening(false)
      onChange({ listened: true })
    }, 1200)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">语音配置</h2>
        <p className="text-sm text-slate-500">选择声音、音量、语速和欢迎语，并通过试听确认是否符合现场服务气质。</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-5">
          <div className="text-sm font-medium text-slate-700 mb-1">声音选择</div>
          <div className="text-xs text-slate-500 mb-4">推荐：{recommendStyle}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {VOICES.map((v) => {
              const selected = voice.voiceId === v.id
              return (
                <div
                  key={v.id}
                  onClick={() => onChange({ voiceId: v.id })}
                  className={`cursor-pointer rounded-xl border p-3 transition-all ${selected ? 'border-brand-500 bg-brand-50 ring-1 ring-brand-500' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold">声</div>
                    {selected && <Icon name="check" className="w-4 h-4 text-brand-600" />}
                  </div>
                  <div className="text-sm font-semibold text-slate-800">{v.name}</div>
                  <div className="text-xs text-slate-500">{v.style}</div>
                </div>
              )
            })}
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm font-medium text-slate-700 mb-4">欢迎语和声音参数</div>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span>音量 {voice.volume}</span>
              </div>
              <Slider value={voice.volume} onChange={(v) => onChange({ volume: v })} />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                <span>语速 {voice.speed}</span>
              </div>
              <Slider value={voice.speed} onChange={(v) => onChange({ speed: v })} />
            </div>
            <div>
              <label className="label">欢迎语</label>
              <textarea
                className="input min-h-[80px] resize-none"
                value={voice.welcomeMsg}
                onChange={(e) => onChange({ welcomeMsg: e.target.value })}
              />
            </div>
            <button onClick={handleListen} className="btn-primary">
              <Icon name={listening ? 'refresh' : 'play'} className={`w-4 h-4 ${listening ? 'animate-spin' : ''}`} />
              试听
            </button>
            {voice.listened && <span className="text-xs text-emerald-600 ml-2">已试听</span>}
          </div>
        </Card>
      </div>
    </div>
  )
}

function TestPublishStep({
  industry,
  scenario,
  capabilities,
  materials,
  points,
  welcomeMsg,
  robotId,
  isGuest,
  onRobotChange,
  onPublish,
  onSaveDraft
}: {
  industry: Industry
  scenario: string
  capabilities: string[]
  materials: DraftConfig['materials']
  points: DraftConfig['points']
  welcomeMsg: string
  robotId: string
  isGuest: boolean
  onRobotChange: (id: string) => void
  onPublish: () => void
  onSaveDraft: () => void
}) {
  const [messages, setMessages] = useState<{ role: 'user' | 'robot'; text: string; source?: string; route?: string }[]>([])
  const [input, setInput] = useState('')

  const presets = CHAT_PRESETS[industry] || []

  const send = (text: string) => {
    if (!text.trim()) return
    const response = getChatResponse(text)
    setMessages((prev) => [
      ...prev,
      { role: 'user', text },
      { role: 'robot', text: response.text, source: response.source, route: response.route }
    ])
    setInput('')
  }

  const checklist = getChecklist(industry, capabilities, materials as any, points as any, welcomeMsg)

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">测试发布</h2>
        <p className="text-sm text-slate-500">先用真实问题测试机器人回答、来源和导航任务，再完成上线前检查并发布。</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Chat */}
        <div className="xl:col-span-3 card p-5 flex flex-col h-[540px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
            {messages.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">
                点击下方示例问题，测试机器人回答效果
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === 'user' ? 'bg-brand-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  {m.role === 'robot' && <div className="text-xs text-slate-400 mb-1">机器人</div>}
                  <div className="leading-relaxed">{m.text}</div>
                  {m.source && (
                    <div className="mt-2 text-xs opacity-80">
                      来源：{m.source}
                    </div>
                  )}
                  {m.route && (
                    <div className="mt-1 text-xs opacity-80">
                      路线预览：{m.route}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {presets.map((q) => (
                <button key={q} onClick={() => send(q)} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="输入问题测试机器人..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send(input)}
              />
              <Button onClick={() => send(input)}>
                <Icon name="send" className="w-4 h-4" />
                发送
              </Button>
            </div>
            <div className="flex gap-2">
              {['入口', '服务点', '餐厅'].map((t) => (
                <button key={t} onClick={() => send(`带我去${t}`)} className="flex-1 btn-ghost text-xs py-1.5 border border-slate-200">
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="xl:col-span-2 card p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">上线前检查</h3>
          <div className="space-y-3 mb-6">
            {checklist.map((item) => (
              <div key={item.key} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                  <Icon name={item.passed ? 'check' : 'alert'} className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-slate-700">{item.label}</div>
                  <div className="text-xs text-slate-500">{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="label">发布到机器人</label>
              <select className="input text-sm" value={robotId} onChange={(e) => onRobotChange(e.target.value)}>
                {ROBOTS.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="white" onClick={onSaveDraft}>
                保存草稿
              </Button>
              <Button onClick={onPublish} disabled={isGuest}>
                {isGuest ? '游客不可发布' : '发布上线'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfigFlowPage

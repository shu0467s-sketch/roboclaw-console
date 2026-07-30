import React, { useState, useMemo, useRef, useEffect } from 'react'
import { Stepper } from '../components/shared/Stepper'
import { Icon } from '../components/shared/Icon'
import { Button } from '../components/shared/Button'
import { Card } from '../components/shared/Card'
import { Toggle } from '../components/shared/Toggle'
import { Slider } from '../components/shared/Slider'
import { Modal } from '../components/shared/Modal'
import type { Industry, DraftConfig, DraftPoint, FormSectionState, FormSectionStatus, KnowledgeFormField, KnowledgeFormSection } from '../types'
import {
  INDUSTRIES,
  INDUSTRY_LABEL,
  CAPABILITIES,
  SPACE_RELATED_CAPABILITIES,
  KNOWLEDGE_FORMS,
  SYSTEMS,
  VOICES,
  DEFAULT_WELCOME,
  VOICE_RECOMMEND,
  DEFAULT_POINTS,
  COLLABORATIVE_ROBOTS,
  ROBOTS,
  getChecklist,
  getChatResponse,
  CHAT_PRESETS
} from '../data/mock'

interface ConfigFlowPageProps {
  draft: DraftConfig
  setDraft: React.Dispatch<React.SetStateAction<DraftConfig>>
  isGuest: boolean
  onPublish: (name: string, industry: Industry, scenario: string, robotId: string) => void
  onBack: () => void
}

// ===== Helpers =====

function computeFormStatus(
  section: KnowledgeFormSection,
  values: Record<string, string | boolean | number>
): FormSectionStatus {
  const hasAny = Object.entries(values).some(([, v]) => {
    if (typeof v === 'boolean') return true
    return v !== '' && v !== undefined && v !== null
  })
  if (!hasAny) return 'empty'
  const requiredFields = section.fields.filter(
    (f) => f.required && (!f.conditionKey || values[f.conditionKey] === true)
  )
  if (requiredFields.length === 0) return 'done'
  const allRequiredFilled = requiredFields.every((f) => {
    const v = values[f.key]
    return v !== '' && v !== undefined && v !== null
  })
  return allRequiredFilled ? 'done' : 'draft'
}

const FORM_STATUS_META: Record<FormSectionStatus, { label: string; color: string; bg: string }> = {
  empty: { label: '待填写', color: 'text-slate-500', bg: 'bg-slate-100' },
  draft: { label: '填写中', color: 'text-amber-600', bg: 'bg-amber-50' },
  done: { label: '已完成', color: 'text-emerald-600', bg: 'bg-emerald-50' }
}

const SCENARIO_DETAILS: Record<string, { scope: string; caps: string[]; prepare: string[] }> = {
  '前台接待': { scope: '酒店大堂迎宾、入住退房咨询、基础问答', caps: ['主动欢迎', '基础问答', '地点指引'], prepare: ['酒店基础信息', '房型信息', '营业时间'] },
  '设施咨询': { scope: '酒店设施位置、开放时间、使用规则', caps: ['基础问答', '知识库回答', '地点指引'], prepare: ['设施服务', '营业时间', '常见问题'] },
  '客房引导': { scope: '引导客人前往客房、介绍房型和设施', caps: ['带路服务', '地点指引', '主动欢迎'], prepare: ['房型信息', '设施服务', '空间配置'] },
  '夜间值守': { scope: '夜间无人值守时段的咨询和引导', caps: ['基础问答', '转人工提醒', '安全兜底回复'], prepare: ['紧急联系人', '服务规则', '常见问题'] },
  '商品导购': { scope: '商品介绍、推荐、价格咨询', caps: ['商品推荐', '基础问答', '活动介绍'], prepare: ['商品基础信息', '价格活动信息', '常见问题'] },
  '活动讲解': { scope: '促销活动、专题展览讲解', caps: ['活动介绍', '商品推荐', '基础问答'], prepare: ['商品基础信息', '价格活动信息', '服务规则'] },
  '区域带路': { scope: '引导客人前往指定区域或店铺', caps: ['带路服务', '地点指引', '主动欢迎'], prepare: ['商场基础信息', '空间配置', '常见问题'] },
  '售后咨询': { scope: '退换货政策、会员权益咨询', caps: ['基础问答', '转人工提醒', '知识库回答'], prepare: ['常见问题', '服务规则', '商品基础信息'] },
  '展品讲解': { scope: '展品背景、亮点、互动讲解', caps: ['商品推荐', '活动介绍', '基础问答'], prepare: ['展品基础信息', '推荐路线', '活动信息'] },
  '路线导览': { scope: '推荐参观路线、引导前往展区', caps: ['带路服务', '地点指引', '主动欢迎'], prepare: ['推荐路线', '展品基础信息', '空间配置'] },
  '参观接待': { scope: '参观登记、流程引导、基础咨询', caps: ['主动欢迎', '基础问答', '转人工提醒'], prepare: ['展厅基础信息', '常见问题', '服务规则'] },
  '会议引导': { scope: '引导参会者前往会议室、会议咨询', caps: ['带路服务', '地点指引', '基础问答'], prepare: ['会议室信息', '常见问题', '空间配置'] },
  '访客接待': { scope: '访客登记、来访引导、身份确认', caps: ['主动欢迎', '基础问答', '转人工提醒'], prepare: ['企业信息', '访客规则', '常见问题'] },
  '信息咨询': { scope: '企业信息、WiFi、停车等常见咨询', caps: ['基础问答', '知识库回答', '地点指引'], prepare: ['企业信息', '常见问题', '会议室信息'] },
  '身份确认': { scope: '访客身份核验、通行区域确认', caps: ['基础问答', '转人工提醒', '安全兜底回复'], prepare: ['访客规则', '企业信息', '服务规则'] },
}

// ===== Main Component =====

export function ConfigFlowPage({ draft, setDraft, isGuest, onPublish, onBack }: ConfigFlowPageProps) {
  const [maxReached, setMaxReached] = useState(draft.step)
  const [publishOpen, setPublishOpen] = useState(false)
  const [draftSaved, setDraftSaved] = useState(false)
  const [chatTested, setChatTested] = useState(false)

  const currentStep = draft.step
  const industry = draft.industry

  const setStep = (i: number) => {
    setDraft((d) => ({ ...d, step: i }))
  }

  const next = () => {
    const n = Math.min(currentStep + 1, 3)
    setDraft((d) => ({ ...d, step: n }))
    setMaxReached((m) => Math.max(m, n))
  }

  const prev = () => {
    setDraft((d) => ({ ...d, step: Math.max(d.step - 1, 0) }))
  }

  const switchIndustry = (ind: Industry) => {
    const welcome = DEFAULT_WELCOME[ind]
    const scenarios = INDUSTRIES.find((x) => x.value === ind)?.scenarios || []
    setDraft((d) => ({
      ...d,
      industry: ind,
      scenario: scenarios[0] || '',
      capabilities: CAPABILITIES.filter((c) => c.defaultOn).map((c) => c.id),
      knowledgeForms: KNOWLEDGE_FORMS[ind].map((section) => ({
        id: section.id,
        status: 'empty' as const,
        values: {}
      })),
      points: DEFAULT_POINTS.map((p) => ({ ...p })),
      voice: { ...d.voice, welcomeMsg: welcome },
      collaborativeRobots: []
    }))
  }

  const selectScenario = (s: string) => {
    setDraft((d) => ({ ...d, scenario: s }))
    setMaxReached((m) => Math.max(m, 1))
  }

  const toggleCapability = (id: string) => {
    setDraft((d) => ({
      ...d,
      capabilities: d.capabilities.includes(id)
        ? d.capabilities.filter((c) => c !== id)
        : [...d.capabilities, id]
    }))
  }

  const updateFormField = (formId: string, key: string, value: string | boolean | number) => {
    setDraft((d) => ({
      ...d,
      knowledgeForms: d.knowledgeForms.map((f) => {
        if (f.id !== formId) return f
        const newValues = { ...f.values, [key]: value }
        const section = d.industry ? KNOWLEDGE_FORMS[d.industry].find((s) => s.id === formId) : null
        const newStatus = section ? computeFormStatus(section, newValues) : f.status
        return { ...f, values: newValues, status: newStatus }
      })
    }))
  }

  const addPoint = (x: number, y: number) => {
    const names = ['大堂入口', '服务台', '餐厅', '电梯口', '会议室', '洗手间', '出口', '活动区']
    const baseName = names[(draft.points.length + 3) % names.length]
    setDraft((d) => ({
      ...d,
      points: [...d.points, { id: `p-${Date.now()}`, name: baseName, type: '关键地点', x, y }]
    }))
  }

  const updatePoint = (id: string, patch: Partial<DraftPoint>) => {
    setDraft((d) => ({
      ...d,
      points: d.points.map((p) => (p.id === id ? { ...p, ...patch } : p))
    }))
  }

  const deletePoint = (id: string) => {
    setDraft((d) => ({ ...d, points: d.points.filter((p) => p.id !== id) }))
  }

  const toggleCollabRobot = (id: string) => {
    setDraft((d) => ({
      ...d,
      collaborativeRobots: d.collaborativeRobots.includes(id)
        ? d.collaborativeRobots.filter((r) => r !== id)
        : [...d.collaborativeRobots, id]
    }))
  }

  const hasSpaceCapability = useMemo(
    () => draft.capabilities.some((c) => SPACE_RELATED_CAPABILITIES.includes(c)),
    [draft.capabilities]
  )

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
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-400">当前行业</span>
            <select
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm font-medium outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 cursor-pointer"
              value={industry}
              onChange={(e) => switchIndustry(e.target.value as Industry)}
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Stepper bar */}
      <div className="px-8 py-3 bg-white border-b border-slate-100 flex-shrink-0">
        <div className="max-w-[1200px] mx-auto">
          <Stepper current={currentStep} maxReached={maxReached} onStepClick={setStep} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0 overflow-y-auto p-8">
        <div className="max-w-[1200px] mx-auto">
          {currentStep === 0 && industry && currentIndustryData && (
            <ScenarioStep
              industry={currentIndustryData}
              scenario={draft.scenario}
              onSelect={selectScenario}
            />
          )}
          {currentStep === 1 && industry && (
            <KnowledgeStep
              industry={industry}
              forms={draft.knowledgeForms}
              onUpdateField={updateFormField}
            />
          )}
          {currentStep === 2 && industry && (
            <CapabilityStep
              capabilities={draft.capabilities}
              onToggleCapability={toggleCapability}
              hasSpaceCapability={hasSpaceCapability}
              points={draft.points}
              onAddPoint={addPoint}
              onUpdatePoint={updatePoint}
              onDeletePoint={deletePoint}
              voice={draft.voice}
              industry={industry}
              onVoiceChange={(v) => setDraft((d) => ({ ...d, voice: { ...d.voice, ...v } }))}
              collaborativeRobots={draft.collaborativeRobots}
              onToggleRobot={toggleCollabRobot}
            />
          )}
          {currentStep === 3 && industry && (
            <TestPublishStep
              industry={industry}
              scenario={draft.scenario}
              capabilities={draft.capabilities}
              knowledgeForms={draft.knowledgeForms}
              points={draft.points}
              welcomeMsg={draft.voice.welcomeMsg}
              hasSpaceCapability={hasSpaceCapability}
              robotId={draft.robotId}
              isGuest={isGuest}
              chatTested={chatTested}
              onChatTested={() => setChatTested(true)}
              onRobotChange={(id) => setDraft((d) => ({ ...d, robotId: id }))}
              onPublish={() => setPublishOpen(true)}
              onSaveDraft={() => setDraftSaved(true)}
            />
          )}
        </div>
      </div>

      {/* Footer actions */}
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
            {currentStep < 3 && (
              <Button onClick={next}>
                下一步
              </Button>
            )}
            {currentStep === 3 && (
              <Button onClick={() => setPublishOpen(true)} disabled={isGuest}>
                {isGuest ? '游客不可发布' : '发布上线'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Publish modal */}
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
                if (isGuest || !industry) return
                onPublish(draft.planName, industry, draft.scenario, draft.robotId)
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
            <div className="flex justify-between"><span>场景</span><span className="text-slate-700 font-medium">{draft.scenario || '-'}</span></div>
            <div className="flex justify-between"><span>已开启能力</span><span className="text-slate-700 font-medium">{draft.capabilities.length} 项</span></div>
          </div>
        </div>
      </Modal>

      <Modal open={draftSaved} onClose={() => setDraftSaved(false)} title="草稿已保存" width="max-w-sm">
        <p className="text-sm text-slate-500">当前配置已暂存到本地状态，您可随时返回继续编辑。</p>
      </Modal>
    </div>
  )
}

// ===== Step 0: 选择业务场景 =====

function ScenarioStep({
  industry,
  scenario,
  onSelect
}: {
  industry: typeof INDUSTRIES[0]
  scenario: string
  onSelect: (s: string) => void
}) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">选择业务场景</h2>
        <p className="text-sm text-slate-500">在{industry.label}行业下选择机器人要承担的具体服务任务。不同业务场景会使用不同能力组合和知识库表单。</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {industry.scenarios.map((s) => {
          const selected = scenario === s
          const detail = SCENARIO_DETAILS[s]
          return (
            <Card key={s} selected={selected} hover onClick={() => onSelect(s)}>
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-semibold text-slate-800">{s}</h3>
                <span className={`text-xs px-2 py-0.5 rounded ${selected ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                  {selected ? '已选' : '未选'}
                </span>
              </div>
              {detail && (
                <>
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-400 mb-1">适用范围</div>
                    <p className="text-sm text-slate-600 leading-relaxed">{detail.scope}</p>
                  </div>
                  <div className="mb-3">
                    <div className="text-xs font-medium text-slate-400 mb-1">推荐能力</div>
                    <div className="flex flex-wrap gap-1">
                      {detail.caps.map((c) => (
                        <span key={c} className="px-1.5 py-0.5 rounded bg-brand-50 text-brand-600 text-xs">{c}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-slate-400 mb-1">需要准备的信息</div>
                    <div className="flex flex-wrap gap-1">
                      {detail.prepare.map((p) => (
                        <span key={p} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-xs">{p}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </Card>
          )
        })}
        <div className="card p-5 border-dashed border-2 border-slate-200 flex flex-col justify-center">
          <div className="text-sm text-slate-500 mb-1">没有你想要的场景？</div>
          <div className="text-xs text-slate-400 mb-3">联系技术支持，为你的业务评估专属方案。</div>
          <button className="btn-outline text-xs self-start">联系技术支持</button>
        </div>
      </div>
    </div>
  )
}

// ===== Step 1: 知识库配置 =====

function KnowledgeStep({
  industry,
  forms,
  onUpdateField
}: {
  industry: Industry
  forms: FormSectionState[]
  onUpdateField: (formId: string, key: string, value: string | boolean | number) => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(forms[0]?.id || null)
  const [savedFlash, setSavedFlash] = useState(false)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sections = KNOWLEDGE_FORMS[industry]
  const systems = SYSTEMS[industry]

  const handleFieldChange = (formId: string, key: string, value: string | boolean | number) => {
    onUpdateField(formId, key, value)
    setSavedFlash(true)
    if (flashTimer.current) clearTimeout(flashTimer.current)
    flashTimer.current = setTimeout(() => setSavedFlash(false), 1500)
  }

  const doneCount = forms.filter((f) => f.status === 'done').length
  const draftCount = forms.filter((f) => f.status === 'draft').length

  useEffect(() => {
    return () => { if (flashTimer.current) clearTimeout(flashTimer.current) }
  }, [])

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-1">知识库配置</h2>
          <p className="text-sm text-slate-500">在线填写业务信息，系统自动保存。能下拉选择的就无需手动输入，必要时可补充上传文件。</p>
        </div>
        <div className="flex items-center gap-2">
          {savedFlash && (
            <span className="text-xs text-emerald-600 flex items-center gap-1">
              <Icon name="check" className="w-3.5 h-3.5" />
              已自动保存
            </span>
          )}
          <span className="badge bg-emerald-50 text-emerald-600">已完成 {doneCount}/{forms.length}</span>
          {draftCount > 0 && <span className="badge bg-amber-50 text-amber-600">填写中 {draftCount}</span>}
        </div>
      </div>

      {/* 已连接系统 */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Icon name="link" className="w-5 h-5 text-brand-600" />
            <h3 className="text-base font-semibold text-slate-800">已连接系统</h3>
          </div>
          <span className="text-xs text-slate-400">系统接入由技术团队完成，此处仅查看连接状态</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {systems.map((sys) => (
            <div
              key={sys.id}
              className={`rounded-xl border p-4 ${sys.connected ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-200 bg-slate-50'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-sm font-semibold text-slate-800">{sys.name}</h4>
                <span className={`badge ${sys.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                  {sys.connected ? '已连接' : '未连接'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-2">{sys.desc}</p>
              {sys.connected ? (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-600">{sys.status}</span>
                  {sys.lastSync && <span className="text-slate-400">最近同步：{sys.lastSync}</span>}
                </div>
              ) : (
                <button className="text-xs text-brand-600 hover:underline">联系技术支持</button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 知识库表单 */}
      <div className="space-y-3">
        {sections.map((section) => {
          const formState = forms.find((f) => f.id === section.id)
          if (!formState) return null
          const meta = FORM_STATUS_META[formState.status]
          const expanded = expandedId === section.id
          return (
            <div key={section.id} className="card overflow-hidden">
              <button
                onClick={() => setExpandedId(expanded ? null : section.id)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${meta.bg}`}>
                    <Icon
                      name={formState.status === 'done' ? 'check' : formState.status === 'draft' ? 'edit' : 'file'}
                      className={`w-5 h-5 ${meta.color}`}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800">{section.title}</h4>
                    <p className="text-xs text-slate-500">{section.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${meta.bg} ${meta.color}`}>{meta.label}</span>
                  <Icon name="chevron" className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </div>
              </button>
              {expanded && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {section.fields
                      .filter((f) => {
                        if (f.type === 'conditional' && f.conditionKey) {
                          return formState.values[f.conditionKey] === true
                        }
                        return true
                      })
                      .map((field) => (
                        <FormField
                          key={field.key}
                          field={field}
                          value={formState.values[field.key]}
                          onChange={(v) => handleFieldChange(section.id, field.key, v)}
                        />
                      ))}
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <Icon name="check" className="w-3.5 h-3.5 text-emerald-500" />
                    填写内容已自动保存，可随时返回修改
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 补充上传文件 */}
      <Card className="p-5 mt-6 border-dashed border-2 border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Icon name="upload" className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700">补充上传文件（可选）</h4>
              <p className="text-xs text-slate-400">如果已有整理好的资料文件，可直接上传作为补充。</p>
            </div>
          </div>
          <button className="btn-outline text-xs">
            <Icon name="upload" className="w-3.5 h-3.5" />
            上传文件
          </button>
        </div>
      </Card>
    </div>
  )
}

// ===== Form Field Renderer =====

function FormField({
  field,
  value,
  onChange
}: {
  field: KnowledgeFormField
  value: string | boolean | number | undefined
  onChange: (v: string | boolean | number) => void
}) {
  const label = (
    <label className="label">
      {field.label}
      {field.required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  )

  switch (field.type) {
    case 'text':
      return (
        <div>
          {label}
          <input
            className="input"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      )
    case 'number':
      return (
        <div>
          {label}
          <div className="flex items-center gap-2">
            <input
              type="number"
              className="input flex-1"
              value={typeof value === 'number' ? value : (typeof value === 'string' && value !== '' ? value : '')}
              onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder={field.placeholder}
            />
            {field.unit && <span className="text-sm text-slate-500 whitespace-nowrap">{field.unit}</span>}
          </div>
        </div>
      )
    case 'select':
      return (
        <div>
          {label}
          <select
            className="input"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">请选择</option>
            {field.options?.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )
    case 'toggle':
      return (
        <div className="flex items-center justify-between py-1.5">
          <span className="text-sm text-slate-600">
            {field.label}
            {field.required && <span className="text-rose-500 ml-0.5">*</span>}
          </span>
          <Toggle checked={!!value} onChange={(v) => onChange(v)} />
        </div>
      )
    case 'textarea':
      return (
        <div className="md:col-span-2">
          {label}
          <textarea
            className="input min-h-[72px] resize-none"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      )
    case 'conditional':
      return (
        <div>
          {label}
          <input
            className="input"
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        </div>
      )
    default:
      return null
  }
}

// ===== Step 2: 能力配置 =====

function CapabilityStep({
  capabilities,
  onToggleCapability,
  hasSpaceCapability,
  points,
  onAddPoint,
  onUpdatePoint,
  onDeletePoint,
  voice,
  industry,
  onVoiceChange,
  collaborativeRobots,
  onToggleRobot
}: {
  capabilities: string[]
  onToggleCapability: (id: string) => void
  hasSpaceCapability: boolean
  points: DraftPoint[]
  onAddPoint: (x: number, y: number) => void
  onUpdatePoint: (id: string, patch: Partial<DraftPoint>) => void
  onDeletePoint: (id: string) => void
  voice: DraftConfig['voice']
  industry: Industry
  onVoiceChange: (v: Partial<DraftConfig['voice']>) => void
  collaborativeRobots: string[]
  onToggleRobot: (id: string) => void
}) {
  const adjustableCaps = CAPABILITIES.filter((c) => !c.isDefault)
  const defaultCaps = CAPABILITIES.filter((c) => c.isDefault)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-1">能力配置</h2>
        <p className="text-sm text-slate-500">配置机器人服务能力、空间点位、语音和多机器人协同。默认能力保证机器人基本接待，可调能力按需开启。</p>
      </div>

      {/* A. 服务能力配置 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-lg bg-brand-600 text-white text-xs font-bold flex items-center justify-center">A</span>
          <h3 className="text-base font-semibold text-slate-800">服务能力配置</h3>
        </div>

        {/* 可调能力 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-slate-700">可调能力</h4>
            <span className="text-xs text-slate-400">可根据业务需要开启或关闭</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {adjustableCaps.map((cap) => {
              const on = capabilities.includes(cap.id)
              return (
                <div
                  key={cap.id}
                  className={`rounded-xl border p-4 transition-all ${on ? 'border-brand-300 bg-brand-50/40 ring-1 ring-brand-200' : 'border-slate-200 bg-white'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{cap.category}</span>
                    <Toggle checked={on} onChange={() => onToggleCapability(cap.id)} />
                  </div>
                  <h5 className="text-sm font-semibold text-slate-800 mb-1">{cap.name}</h5>
                  <p className="text-xs text-slate-500 leading-relaxed">{cap.desc}</p>
                  {cap.recommendFor && on && (
                    <div className="mt-2 text-xs text-brand-600 flex items-center gap-1">
                      <Icon name="check" className="w-3 h-3" />
                      {cap.recommendFor}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 默认能力 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-slate-700">默认能力</h4>
            <span className="badge bg-slate-100 text-slate-500">系统默认开启</span>
          </div>
          <p className="text-xs text-slate-400 mb-3">这些能力用于保证机器人可以正常接待和回答问题，不可关闭。</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {defaultCaps.map((cap) => (
              <div key={cap.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded">{cap.category}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Icon name="lock" className="w-3 h-3" />
                    已开启
                  </span>
                </div>
                <h5 className="text-sm font-semibold text-slate-700 mb-1">{cap.name}</h5>
                <p className="text-xs text-slate-500 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* B. 空间配置 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-lg bg-brand-600 text-white text-xs font-bold flex items-center justify-center">B</span>
          <h3 className="text-base font-semibold text-slate-800">空间配置</h3>
        </div>
        {hasSpaceCapability ? (
          <SpaceConfigSection
            points={points}
            onAdd={onAddPoint}
            onUpdate={onUpdatePoint}
            onDelete={onDeletePoint}
          />
        ) : (
          <div className="flex items-center gap-3 py-6 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
              <Icon name="map" className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500">当前未启用「地点指引」或「带路服务」，无需配置空间。</p>
              <p className="text-xs text-slate-400 mt-0.5">如需引导客人前往指定地点，请在上方可调能力中开启相关能力。</p>
            </div>
          </div>
        )}
      </Card>

      {/* C. 语音配置 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-lg bg-brand-600 text-white text-xs font-bold flex items-center justify-center">C</span>
          <h3 className="text-base font-semibold text-slate-800">语音配置</h3>
        </div>
        <VoiceConfigSection voice={voice} industry={industry} onChange={onVoiceChange} />
      </Card>

      {/* D. 多机器人协同 */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <span className="w-7 h-7 rounded-lg bg-brand-600 text-white text-xs font-bold flex items-center justify-center">D</span>
          <h3 className="text-base font-semibold text-slate-800">多机器人协同</h3>
        </div>
        <MultiRobotSection
          selectedRobots={collaborativeRobots}
          onToggle={onToggleRobot}
          currentScenario={''}
        />
      </Card>
    </div>
  )
}

// ===== Space Config Section =====

function SpaceConfigSection({
  points,
  onAdd,
  onUpdate,
  onDelete
}: {
  points: DraftPoint[]
  onAdd: (x: number, y: number) => void
  onUpdate: (id: string, patch: Partial<DraftPoint>) => void
  onDelete: (id: string) => void
}) {
  const [testResult, setTestResult] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

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
    setTestResult(`导航测试：路线可达，预计 ${seconds} 秒到达。`)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <div
          ref={mapRef}
          onClick={handleMapClick}
          className="relative w-full h-[380px] rounded-xl border border-slate-200 bg-white overflow-hidden cursor-crosshair"
          style={{
            backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        >
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
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
          {points.map((p) => (
            <div key={p.id} className="rounded-lg border border-slate-200 p-3">
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
                onChange={(e) => onUpdate(p.id, { type: e.target.value as DraftPoint['type'] })}
              >
                <option>入口</option>
                <option>服务点</option>
                <option>关键地点</option>
                <option>出口</option>
              </select>
            </div>
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
  )
}

// ===== Voice Config Section =====

function VoiceConfigSection({
  voice,
  industry,
  onChange
}: {
  voice: DraftConfig['voice']
  industry: Industry
  onChange: (v: Partial<DraftConfig['voice']>) => void
}) {
  const recommendStyle = VOICE_RECOMMEND[industry]
  const [listening, setListening] = useState(false)

  const handleListen = () => {
    setListening(true)
    setTimeout(() => {
      setListening(false)
      onChange({ listened: true })
    }, 1200)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div>
        <div className="text-sm font-medium text-slate-700 mb-1">声音选择</div>
        <div className="text-xs text-slate-500 mb-4">
          {INDUSTRY_LABEL[industry]}推荐：
          <span className="text-brand-600 font-medium ml-1">{recommendStyle}</span>
        </div>
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
                  <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center">
                    <Icon name="mic" className="w-4 h-4" />
                  </div>
                  {selected && <Icon name="check" className="w-4 h-4 text-brand-600" />}
                </div>
                <div className="text-sm font-semibold text-slate-800">{v.name}</div>
                <div className="text-xs text-slate-500">{v.style}</div>
              </div>
            )
          })}
        </div>
      </div>
      <div>
        <div className="text-sm font-medium text-slate-700 mb-4">声音参数和欢迎语</div>
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span>音量</span>
              <span className="font-medium">{voice.volume}</span>
            </div>
            <Slider value={voice.volume} onChange={(v) => onChange({ volume: v })} />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span>语速</span>
              <span className="font-medium">{voice.speed}</span>
            </div>
            <Slider value={voice.speed} onChange={(v) => onChange({ speed: v })} />
          </div>
          <div>
            <label className="label">欢迎语</label>
            <textarea
              className="input min-h-[80px] resize-none"
              value={voice.welcomeMsg}
              onChange={(e) => onChange({ welcomeMsg: e.target.value })}
              placeholder="输入机器人欢迎语..."
            />
            <button
              onClick={() => onChange({ welcomeMsg: DEFAULT_WELCOME[industry] })}
              className="text-xs text-brand-600 hover:underline mt-1.5"
            >
              使用推荐欢迎语
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleListen} className="btn-primary">
              <Icon name={listening ? 'refresh' : 'play'} className={`w-4 h-4 ${listening ? 'animate-spin' : ''}`} />
              试听
            </button>
            {voice.listened && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Icon name="check" className="w-3.5 h-3.5" />
                已试听
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ===== Multi-Robot Section =====

function MultiRobotSection({
  selectedRobots,
  onToggle,
  currentScenario
}: {
  selectedRobots: string[]
  onToggle: (id: string) => void
  currentScenario: string
}) {
  const availableRobots = COLLABORATIVE_ROBOTS.filter((r) => r.status !== 'offline')

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">
        勾选需要与当前机器人协同工作的其他机器人。系统会自动分配服务任务，避免重复接待。
      </p>
      {availableRobots.length === 0 ? (
        <div className="flex items-center gap-3 py-6 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <Icon name="robot" className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500">暂无可协同机器人</p>
            <p className="text-xs text-slate-400 mt-0.5">可先完成当前服务方案配置，后续再添加协同机器人。</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-4">
            {availableRobots.map((robot) => {
              const selected = selectedRobots.includes(robot.id)
              const statusMeta = robot.status === 'online'
                ? { label: '在线', color: 'text-emerald-600', dot: 'bg-emerald-500' }
                : { label: '忙碌', color: 'text-amber-600', dot: 'bg-amber-500' }
              return (
                <div
                  key={robot.id}
                  className={`rounded-xl border p-4 transition-all ${selected ? 'border-brand-300 bg-brand-50/40 ring-1 ring-brand-200' : 'border-slate-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                        <Icon name="robot" className="w-5 h-5 text-slate-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-semibold text-slate-800">{robot.name}</h5>
                          <span className={`text-xs flex items-center gap-1 ${statusMeta.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                            {statusMeta.label}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          位置：{robot.location} · 当前方案：{robot.currentPlan}
                        </div>
                      </div>
                    </div>
                    <Toggle checked={selected} onChange={() => onToggle(robot.id)} />
                  </div>
                </div>
              )
            })}
          </div>
          {selectedRobots.length > 0 && (
            <div className="rounded-xl bg-brand-50 border border-brand-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="check" className="w-4 h-4 text-brand-600" />
                <span className="text-sm font-medium text-brand-700">协同说明</span>
              </div>
              <p className="text-xs text-brand-600 leading-relaxed">
                已选择 {selectedRobots.length} 台机器人参与协同。当前机器人负责主要接待任务，
                协同机器人将在各自区域配合服务，避免重复接待和路线冲突。
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ===== Step 3: 测试发布 =====

function TestPublishStep({
  industry,
  scenario,
  capabilities,
  knowledgeForms,
  points,
  welcomeMsg,
  hasSpaceCapability,
  robotId,
  isGuest,
  chatTested,
  onChatTested,
  onRobotChange,
  onPublish,
  onSaveDraft
}: {
  industry: Industry
  scenario: string
  capabilities: string[]
  knowledgeForms: FormSectionState[]
  points: DraftPoint[]
  welcomeMsg: string
  hasSpaceCapability: boolean
  robotId: string
  isGuest: boolean
  chatTested: boolean
  onChatTested: () => void
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
    onChatTested()
  }

  const checklist = getChecklist(
    scenario,
    capabilities,
    knowledgeForms,
    points,
    welcomeMsg,
    hasSpaceCapability,
    chatTested
  )

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">测试发布</h2>
        <p className="text-sm text-slate-500">用真实问题测试机器人回答效果，完成上线前检查后发布。</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 xl:items-stretch">
        {/* 聊天测试 */}
        <div className="xl:col-span-3 card p-5 flex flex-col min-h-[500px]">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="message" className="w-5 h-5 text-brand-600" />
            <h3 className="text-sm font-semibold text-slate-800">聊天测试</h3>
            {chatTested && (
              <span className="badge bg-emerald-50 text-emerald-600 ml-auto">
                <Icon name="check" className="w-3 h-3" />
                已测试
              </span>
            )}
          </div>
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
                    <div className="mt-2 text-xs opacity-80">回答来源：{m.source}</div>
                  )}
                  {m.route && (
                    <div className="mt-1 text-xs opacity-80">路线预览：{m.route}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {presets.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                >
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
          </div>
        </div>

        {/* 发布检查 + 发布操作 */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* 路线预览（仅启用带路/地点指引时展示） */}
          {hasSpaceCapability && (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <Icon name="map" className="w-4 h-4 text-brand-600" />
                <h3 className="text-sm font-semibold text-slate-800">路线预览</h3>
              </div>
              {points.length > 0 ? (
                <div className="space-y-1.5">
                  {points.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-2 text-sm">
                      <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-slate-700">{p.name}</span>
                      <span className="text-xs text-slate-400">{p.type}</span>
                      {i < points.length - 1 && <Icon name="arrowRight" className="w-3 h-3 text-slate-300 ml-auto" />}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">尚未设置地点，请在能力配置中添加地图点位。</p>
              )}
            </Card>
          )}

          {/* 发布检查 */}
          <Card className="p-4 flex-1 flex flex-col">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">发布检查</h3>
            <div className="space-y-2 mb-4">
              {checklist.map((item) => (
                <div key={item.key} className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                    <Icon name={item.passed ? 'check' : 'alert'} className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-700">{item.label}</div>
                    <div className="text-xs text-slate-500">{item.value}</div>
                  </div>
                  {!item.passed && item.required && (
                    <span className="text-xs text-rose-500 flex-shrink-0">需完成</span>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 mt-auto">
              <div>
                <label className="label">发布到机器人</label>
                <select className="input text-sm" value={robotId} onChange={(e) => onRobotChange(e.target.value)}>
                  {ROBOTS.map((r) => (
                    <option key={r.id} value={r.id}>{r.name} · {r.location}</option>
                  ))}
                </select>
              </div>
              {isGuest && (
                <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2.5 flex items-center gap-2">
                  <Icon name="alert" className="w-4 h-4 flex-shrink-0" />
                  游客模式下可测试，但不能真实发布。请登录企业账号后发布。
                </div>
              )}
              <div className="grid grid-cols-2 gap-2">
                <Button variant="white" onClick={onSaveDraft}>
                  保存草稿
                </Button>
                <Button onClick={onPublish} disabled={isGuest}>
                  {isGuest ? '游客不可发布' : '发布上线'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ConfigFlowPage

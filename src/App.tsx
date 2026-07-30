import React, { useState, useCallback } from 'react'
import { Sidebar } from './components/Sidebar'
import { LoginPage } from './pages/LoginPage'
import { WorkbenchPage } from './pages/WorkbenchPage'
import { ConfigFlowPage } from './pages/ConfigFlowPage'
import { OperationPage } from './pages/OperationPage'
import { HelpPage } from './pages/HelpPage'
import { Modal } from './components/shared/Modal'
import { Card } from './components/shared/Card'
import { Icon } from './components/shared/Icon'
import { Button } from './components/shared/Button'
import type { PageKey, UserInfo, ServicePlan, Industry, DraftConfig } from './types'
import {
  SERVICE_PLANS,
  DEFAULT_WELCOME,
  INDUSTRIES,
  INDUSTRY_LABEL,
  CAPABILITIES,
  KNOWLEDGE_FORMS,
  DEFAULT_POINTS
} from './data/mock'

const DEFAULT_USER: UserInfo = {
  name: '运营主管',
  role: '运营主管',
  enterprise: '悦澜酒店集团',
  domain: 'hotel-demo.roboclaw.cn',
  isGuest: false,
  avatar: ''
}

const GUEST_USER: UserInfo = {
  name: '游客',
  role: '游客',
  enterprise: '体验空间',
  domain: 'guest.roboclaw.cn',
  isGuest: true,
  avatar: ''
}

const EMPTY_DRAFT: DraftConfig = {
  planName: '',
  industry: null,
  scenario: '',
  capabilities: [],
  knowledgeForms: [],
  points: [],
  voice: { voiceId: 'warm-female', volume: 64, speed: 50, welcomeMsg: '', listened: false },
  robotId: 'RoboClaw-A01',
  collaborativeRobots: [],
  step: 0
}

/** Initialize draft fields that depend on industry */
function initDraftForIndustry(industry: Industry): Partial<DraftConfig> {
  const welcome = DEFAULT_WELCOME[industry]
  const scenarios = INDUSTRIES.find((x) => x.value === industry)?.scenarios || []
  return {
    industry,
    scenario: scenarios[0] || '',
    capabilities: CAPABILITIES.filter((c) => c.defaultOn).map((c) => c.id),
    knowledgeForms: KNOWLEDGE_FORMS[industry].map((section) => ({
      id: section.id,
      status: 'empty' as const,
      values: {}
    })),
    points: DEFAULT_POINTS.map((p) => ({ ...p })),
    voice: { voiceId: 'warm-female', volume: 64, speed: 50, welcomeMsg: welcome, listened: false },
    collaborativeRobots: []
  }
}

const INDUSTRY_ICON: Record<Industry, string> = {
  hotel: 'building',
  mall: 'tag',
  exhibition: 'chart',
  reception: 'user'
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [user, setUser] = useState<UserInfo>(DEFAULT_USER)
  const [page, setPage] = useState<PageKey>('workbench')
  const [plans, setPlans] = useState<ServicePlan[]>(SERVICE_PLANS)
  const [draft, setDraft] = useState<DraftConfig>(EMPTY_DRAFT)
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [industryModalOpen, setIndustryModalOpen] = useState(false)

  const handleLogin = (guest: boolean) => {
    setUser(guest ? GUEST_USER : DEFAULT_USER)
    setLoggedIn(true)
    setPage('workbench')
  }

  const handleLogout = () => {
    setLoggedIn(false)
    setUser(DEFAULT_USER)
    setPage('workbench')
    setDraft(EMPTY_DRAFT)
    setEditingPlanId(null)
    setIndustryModalOpen(false)
  }

  // 点击"新建服务方案" → 弹出行业选择弹窗（不直接进入 Stepper）
  const startNewPlan = useCallback(() => {
    setIndustryModalOpen(true)
  }, [])

  // 在弹窗中选择行业后 → 初始化草稿并进入方案配置
  const selectIndustry = useCallback((ind: Industry) => {
    setDraft({ ...EMPTY_DRAFT, ...initDraftForIndustry(ind) })
    setEditingPlanId(null)
    setIndustryModalOpen(false)
    setPage('config')
  }, [])

  const continuePlan = useCallback((plan: ServicePlan) => {
    const welcome = DEFAULT_WELCOME[plan.industry]
    setDraft({
      planName: plan.name,
      industry: plan.industry,
      scenario: plan.scenario,
      capabilities: plan.capabilities && plan.capabilities.length > 0
        ? plan.capabilities
        : CAPABILITIES.filter((c) => c.defaultOn).map((c) => c.id),
      knowledgeForms: KNOWLEDGE_FORMS[plan.industry].map((section) => ({
        id: section.id,
        status: 'empty' as const,
        values: {}
      })),
      points: (plan.points || []).map((p) => ({ id: p.id, name: p.name, type: p.type, x: p.x, y: p.y })),
      voice: plan.voice
        ? { voiceId: plan.voice.voiceId, volume: plan.voice.volume, speed: plan.voice.speed, welcomeMsg: plan.voice.welcomeMsg, listened: plan.voice.listened }
        : { voiceId: 'warm-female', volume: 64, speed: 50, welcomeMsg: welcome, listened: false },
      robotId: plan.robotId || 'RoboClaw-A01',
      collaborativeRobots: [],
      step: 0
    })
    setEditingPlanId(plan.id)
    setPage('config')
  }, [])

  const publishPlan = useCallback((name: string, industry: Industry, scenario: string, robotId: string) => {
    const newPlan: ServicePlan = {
      id: `plan-${Date.now()}`,
      name: name || `${INDUSTRY_LABEL[industry]}${scenario}`,
      industry,
      scenario,
      status: 'running',
      progress: 100,
      lastModified: '刚刚',
      onlineDuration: '刚刚上线',
      serviceCount: 0,
      satisfaction: 0,
      currentStep: 4,
      robotId
    }
    setPlans((prev) => [newPlan, ...prev.filter((p) => p.id !== editingPlanId)])
    setDraft(EMPTY_DRAFT)
    setEditingPlanId(null)
    setPage('operation')
  }, [editingPlanId])

  const runningCount = plans.filter((p) => p.status === 'running').length

  if (!loggedIn) {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <Sidebar
        current={page}
        onNavigate={setPage}
        user={user}
        runningCount={runningCount}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {page === 'workbench' && (
          <WorkbenchPage
            user={user}
            plans={plans}
            onNewPlan={startNewPlan}
            onContinuePlan={continuePlan}
            onNavigate={setPage}
          />
        )}
        {page === 'config' && (
          <ConfigFlowPage
            draft={draft}
            setDraft={setDraft}
            isGuest={user.isGuest}
            onPublish={publishPlan}
            onBack={() => setPage('workbench')}
          />
        )}
        {page === 'operation' && <OperationPage plans={plans} onNavigate={setPage} />}
        {page === 'help' && <HelpPage />}
      </main>

      {/* 行业选择弹窗 */}
      <Modal
        open={industryModalOpen}
        onClose={() => setIndustryModalOpen(false)}
        title="选择行业"
        subtitle="选择机器人将服务的行业，系统会自动带出对应的业务场景、知识库表单和推荐能力。"
        width="max-w-3xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INDUSTRIES.map((ind) => (
            <Card
              key={ind.value}
              hover
              onClick={() => selectIndustry(ind.value)}
              className="relative h-full"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                  <Icon name={INDUSTRY_ICON[ind.value]} className="w-5.5 h-5.5 text-brand-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-800">{ind.label}</h3>
                </div>
                <Icon name="arrowRight" className="w-4 h-4 text-slate-300" />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed mb-3">{ind.desc}</p>
              <div className="text-xs text-slate-400">
                <div className="font-medium text-slate-600 mb-1">常见业务场景</div>
                <div className="flex flex-wrap gap-1">
                  {ind.scenarios.map((s) => (
                    <span key={s} className="px-1.5 py-0.5 rounded bg-slate-100">{s}</span>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">选择行业后进入方案配置，可在顶部切换行业。</span>
          <Button variant="white" onClick={() => setIndustryModalOpen(false)}>
            取消
          </Button>
        </div>
      </Modal>
    </div>
  )
}
